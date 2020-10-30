<template>
    <div id="navbar">
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <router-link to="/" class="navbar-brand">Let's Bee</router-link>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item active">
                        <router-link to="/" class="nav-link">Home <span class="sr-only">(current)</span></router-link>
                    </li>
                    <li v-if="loggedIn" class="nav-item">
                        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
                    </li>
                </ul>
                <ul v-if="!loggedIn" class="navbar-nav">
                    <li class="nav-item">
                        <router-link to="/login" class="btn btn-primary">Login</router-link>
                    </li>
                </ul>
                <ul v-else class="navbar-nav">
                    <li class="nav-item">
                        <router-link to="/orders" class="nav-link"><i class="fas fa-shopping-cart"></i></router-link>
                    </li>
                    <li class="nav-item dropdown" v-if="notifications.length > 0">
                        <a class="nav-link" href="#" id="orderDd" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-bell"></i>
                            <i v-if="newNotification" class="new"></i>
                        </a>
                        <ul class="dropdown-menu dm-notification">
                            <li class="head text-light bg-dark">
                                <div class="row">
                                    <div class="col-lg-12 col-sm-12 col-12">
                                        <span>Notifications ({{ notifications.length }})</span>
                                        <a href="#" class="float-right text-light">Mark all as read</a>
                                    </div>
                                </div>
                            </li>
                            <li v-for="notification in notifications" :key="notification.id" v-bind:class="'notification-box' + (notification.status ? ' active' : '')">
                                <div class="nb-link" @click="openNotification(notification.id)">
                                    <strong class="text-info">{{ notification.title }}</strong>
                                    <div class="nb-content">{{ notification.body }}</div>
                                </div>
                            </li>
                        </ul>
                    </li>
                    <li class="nav-item dropdown" v-else>
                        <a class="nav-link" href="#" id="orderDd" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-bell"></i>
                        </a>
                        <ul class="dropdown-menu dm-notification">
                            <li class="head text-light bg-dark">
                                <span>Notifications (0)</span>
                            </li>
                            <li class="notification-box">
                                <div class="opacity-mh text-center"> No Notifications</div>
                            </li>
                        </ul>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="userAccountDd" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {{ auth_name }}
                        </a>
                        <div class="dropdown-menu dm-profile" aria-labelledby="userAccountDd">
                            <router-link to="/your-delivery-location" class="dropdown-item"> Your Delivery location</router-link>
                            <a class="dropdown-item" href="#" @click="SignOut">Logout</a>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>

        <div class="loader" :class="isLoader"></div>

        <div v-if="is_notify" class="notification-alert">
            <div class="na-body">
                Click the exclamation point to give permission to send you desktop notifications.
            </div>
        </div>

    </div>
</template>

<script>
import { db, auth, messaging } from "../firebase-config"

export default {
    data() {
        return {
            is_notify: false,
            loggedIn: false,
            auth_name: "",
            newNotification: false,
            notification_token: "",
            notifications: []
        };
    },

    computed: {
        isLoader: function() {
            return {show: this.$store.state.loader}
        }
    },

    created() {
        this.$session.start();
        
        auth.onAuthStateChanged((authUser) => {
            this.loggedIn = !!authUser;

            if (!authUser) {
                return false;
            }

            let userCollection = db.collection("users");
            userCollection.where('uid', "==", authUser.uid).get().then(result => {
                let users_data = result.docs.map(user => { return { id: user.id, ...user.data() } });
                
                let user_id = users_data[0].id;
                this.auth_name = users_data[0].name;

                if (!this.$session.exists("auid") || this.$session.get("auid") === undefined) {
                    this.$session.set('auid', user_id);
                }

                if (messaging == null) {
                    return false;
                }
                
                messaging.getToken().then((currentToken) => {
                    if (!currentToken) {
                        alert("No Instance ID token available. ")
                        return false;
                    }

                    this.notification_token = currentToken;

                    if (currentToken !== users_data[0].notification_token) {
                        userCollection.doc(user_id).update({
                            notification_token: currentToken
                        });
                    }
                }).catch((err) => {
                    if (!messaging.swRegistration) { 
                        this.$store.commit("showLoader");
                        this.is_notify = true;
                        return false;
                    }
                    console.log('An error occurred while retrieving token. ', err);
                    alert("Failed to load google firebase notification.");
                });

                messaging.onMessage((payload) => {
                    let meta = JSON.parse(payload.data.meta);
                    this.notifications.unshift({
                        id: meta.id,
                        type: payload.data.type,
                        title: payload.notification.title,
                        body: payload.notification.body,
                        status: true,
                    });
                    this.newNotification = true;
                });

                
            }).catch(this.catchError); // get user

        });
    },
    methods: {

        SignOut: function() {
            auth.signOut().then(() => {
                console.log("successfully logged out");
                this.$session.clear();

                this.$router.replace({name: "Login"});
            }).catch(this.catchError);
        },

        validateNotifications: function() {
            let status = false;
            this.notifications.forEach((notification) => {
                if (notification.status) {
                    status = true;
                    return notification;
                }
            });
            this.newNotification = status;
        },

        openNotification: function(notification_id) {
            this.notifications.forEach((notification) => {
                if (notification.id == notification_id) {
                    notification.status = false;
                    this.validateNotifications();
                    if (this.$router.currentRoute != '/' + notification.type + '/' + notification.id) {
                        this.$router.push('/' + notification.type + '/' + notification.id);
                    }
                }
            });
        },

        catchError: function(err) {
            console.log(err);
            alert("Something went wrong");
            if (err.response) {
                console.log(err.response.data)
            }
        },

        showLoader: function() {
            this.$store.commit("showLoader");
        }
        
    },
    beforeDestroy() {
        this.loggedIn = false;
        this.auth_name = "";
    }
}
</script>