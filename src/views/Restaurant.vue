<template>
    <div class="container">
        <h1>Restaurants</h1>
        
        <div class="row mb-4">
            <div v-for="restaurant in restaurants" :key="restaurant.id" class="col-6">
                <div class="card">
                    <h5 class="card-header">{{ restaurant.name}}</h5>
                    <div class="card-body">
                        <p class="card-text" v-html="restaurant.description"></p>
                        <router-link v-bind:to="'/restaurant/' + restaurant.id" class="btn btn-primary">View</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { restaurantCollection } from "../firebase-config";

    export default {
        data() {
            return {
                restaurants: []
            }
        },

        created() {
            document.title = "Let's Bee | Restaurant List";

            this.$store.commit("showLoader");
            restaurantCollection.get().then((result) => {
                this.restaurants = result.docs.map(doc => {
                    return { id: doc.id, ...doc.data() }
                });
                this.$store.commit("hideLoader");

            }).catch((err) => {
                console.log(err);
                alert("Something went wrong. Failed to load the restaurant lists");
                if (err.response) {
                    console.log(err.response.data)
                }
            });
            
        },

        beforeDestroy() {
            this.restaurants = [];
        }
    }
</script>