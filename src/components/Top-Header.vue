<template>
    <div>
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
                        <router-link to="/orders" class="nav-link">Orders</router-link>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="userAccountDd" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {{ auth_name }}
                        </a>
                        <div class="dropdown-menu" aria-labelledby="userAccountDd">
                            <a class="dropdown-item" href="#" @click="SignOut">Logout</a>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
</template>

<script>
    import { auth } from "../firebase-config"
    
    export default {
        created() {
            auth.onAuthStateChanged(
                user => {
                    if (user) {
                        this.auth_name = user.displayName;
                    }

                    this.loggedIn = !!user;
                }
            )
        },
        data() {
            return {
                loggedIn: false,
                auth_name: ""
            };
        },
        methods: {
            SignOut: function() {
                auth.signOut().then(
                    () => {
                        console.log("successfully logged out");
                        this.$router.replace({name: "Login"});
                    },
                    err => {
                        console.log(err);
                    }
                )
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>