<template>
    <div class="container">
        <h1>Restaurants</h1>
        
        <div class="row">
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

    import { db } from "../firebase-config";

    export default {
        data() {
            return {
                restaurants: []
            }
        },
        created() {
            db.collection("restaurants").get().then(
                (result) => {
                    this.restaurants = result.docs.map(doc => {
                        return { id: doc.id, ...doc.data() }
                    });
                }
            )
        },
        beforeDestroy() {
            this.restaurants = [];
        }
    }
</script>

<style lang="scss" scoped>

</style>