<template>
    <div class="text-center">

        <form class="form-signin" @submit.prevent="register">
            
            <h1 class="h3 mb-3 font-weight-normal">Registration</h1>
            
            <div class="form-group">
                <label for="inputEmail" class="sr-only">Email address</label>
                <input type="email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus v-model="email">
            </div>
            
            <div class="form-group">
                <label for="inputPassword" class="sr-only">Password</label>
                <input type="password" id="inputPassword" class="form-control" placeholder="Password" required v-model="password">
            </div>
            
            <div class="form-group">
                <label for="inputName" class="sr-only">First Name</label>
                <input type="text" id="inputName" class="form-control" placeholder="Name" required v-model="name">
            </div>

            <button class="btn btn-lg btn-primary btn-block" type="submit">Register</button>

            <p class="mt-3">
                Already have an Account? 
                <router-link to="/login">Login</router-link>
            </p>
        </form>
       
    </div>
</template>

<script>
    import firebase from 'firebase'
    import { auth, userCollection } from '../firebase-config'

    export default {
        name: "Register",
        data() {
            return {
                name: "",
                email: "",
                password: "",
            }
        },
        register: function() {
            auth.createUserWithEmailAndPassword(this.email, this.password).then(
                (result) => {
                    userCollection.where('uid', "==", result.user.uid).get().then(
                        (result) => {
                            if (result.empty) {
                                userCollection.add({
                                    uid: result.user.uid,
                                    name: this.name,
                                    type: "customer",
                                    location: new firebase.firestore.GeoPoint(0, 0),
                                    notification_token: null
                                }).then(() => {
                                    alert("Successfully Registered");
                                    this.$router.replace({name: "Login"});
                                }).catch((error) => {
                                    alert("Something went wrong, please contact us. - " + error);
                                });
                            }
                        }
                    );
                },
                err => {
                    alert(err);
                }
            );
        },
        beforeDestroy() {
            this.name =  "";
            this.email =  "";
            this.password =  "";
        }
    }
</script>

<style lang="scss" scoped>
    html, body { height: 100%; }
    body {
        display: -ms-flexbox;display: -webkit-box; display: flex; -ms-flex-align: center; -ms-flex-pack: center;
        -webkit-box-align: center; align-items: center; -webkit-box-pack: center; justify-content: center; padding-top: 40px; padding-bottom: 40px; background-color: #f5f5f5;
    }
</style>