<template>
    <div class="text-center">
        
        <h1>Login</h1>

        <form class="form-signin" @submit.prevent="login">
            <div class="form-group">
                <label for="inputEmail" class="sr-only">Email address</label>
                <input type="email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus v-model="email">
            </div>
            
            <div class="form-group">
                <label for="inputPassword" class="sr-only">Password</label>
                <input type="password" id="inputPassword" class="form-control" placeholder="Password" required v-model="password">
            </div>

            <div class="form-group">
                <button class="btn btn-lg btn-primary btn-block" type="submit">Login</button>
            </div>

            <div class="text-center my-3">
                OR
            </div>

            <div class="login-as-google">
                <button type="button" class="btn btn-lg btn-primary btn-block social-button-google" @click="signInWithGoogle" > 
                    <i class="fab fa-google"></i>
                    <span>Login in With Google</span>
                </button>
            </div>
            <div class="login-as-facebook">
                <button type="button" class="btn btn-lg btn-primary btn-block social-button-facebook" @click="signInWithFacebook" > 
                    <i class="fab fa-facebook"></i>
                    <span>Login in With Facebook</span>
                </button>
            </div>
            
            <p>
                Need an Account? 
                <router-link to="/register">Sign Up </router-link>
            </p>
        </form>

<p id="token-result"></p>
    </div>
    
</template>

<script>
import firebase from "firebase";
import { auth, db } from "../firebase-config";

const userCollection = db.collection("users");

export default {
    created() {
        this.$session.start();
    },
    name: "Login",
    data() {
        return {
            email: "",
            password: ""
        }
    },
    methods: {
        login: function() {
            auth.signInWithEmailAndPassword(this.email, this.password)
                .then(
                    () => {
                        this.$router.replace({name: "Dashboard"});
                    },
                    err => {
                        alert(err);
                    }
                );
        },
        signInWithGoogle: function() {
            var provider = new firebase.auth.GoogleAuthProvider();

            auth.signInWithPopup(provider).then(
                (result) => {
                    
                    this.checkUser(result.user.uid, result.user.displayName, "customer", null);

                    this.$router.replace({name: "Dashboard"});
                },
                (err) => {
                    alert(err);
                }
            )
        },
        signInWithFacebook: function() {
            var provider = new firebase.auth.FacebookAuthProvider();

            auth.signInWithPopup(provider).then(
                (result) => {

                    this.checkUser(result.user.uid, result.user.displayName, "customer", null);
                    
                    this.$router.replace({name: "Dashboard"});
                },
                (err) => {
                    alert(err);
                }
            )
        },
        checkUser: function(user_id, name, type, address) {
            userCollection.where('uid', "==", user_id).get().then(result => {
                if (result.empty) {
                    userCollection.add({
                        uid: user_id,
                        name: name,
                        type: type,
                        address: address,
                        order_status: "enabled"
                    }).then(users => {
                        this.$session.set('auid', users.id);
                    })
                } else {
                    let users_data = result.docs.map(user => { return { id: user.id, ...user.data() } });
                    this.$session.set('auid', users_data[0].id);
                }
            });
        }
    },

}
</script>

<style lang="scss" scoped>

</style>