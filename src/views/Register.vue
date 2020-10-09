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
                <input type="email" id="inputName" class="form-control" placeholder="Name" required v-model="name">
            </div>

            <div class="form-group">
                <label for="inputAddress" class="sr-only">Address</label>
                <input type="email" id="inputAddress" class="form-control" placeholder="Address" required v-model="address">
            </div>

            <button class="btn btn-lg btn-primary btn-block" type="submit">Register</button>

            <p class="mt-3">
                Already have an Account? 
                <router-link to="/sign-in">Sign In</router-link>
            </p>
        </form>
       
    </div>
</template>

<script>

    import { auth, db } from '../firebase-config';

    export default {
        name: "Register",
        data() {
            return {
                name: "",
                email: "",
                password: "",
                address: ""
            }
        },
        register: function() {
            auth.createUserWithEmailAndPassword(this.email, this.password)
                .then(
                    result => {
                        db.collection("users")
                            .add({
                                uid: result.user.uid,
                                name: this.name,
                                type: "customer",
                                address: this.address,
                                order_status: "enabled"
                            }).then(() => {
                                alert("Successfully Registered");
                                this.$router.replace({name: "Login"});
                            }).catch((error) => {
                                alert("Something went wrong, please contact us. - " + error);
                            });
                    },
                    err => {
                        alert(err);
                    }
                );
        }
    }
</script>

<style lang="scss" scoped>
html,
body {
  height: 100%;
}

body {
  display: -ms-flexbox;
  display: -webkit-box;
  display: flex;
  -ms-flex-align: center;
  -ms-flex-pack: center;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  padding-top: 40px;
  padding-bottom: 40px;
  background-color: #f5f5f5;
}


</style>