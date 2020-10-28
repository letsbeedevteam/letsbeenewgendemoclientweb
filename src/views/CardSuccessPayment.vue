<template>
    <div class="text-center">
        <div v-if="!loading">
            <h1>Payment has been accepted</h1>
            <div v-if="is_mobile">
                <small class="d-block">You can now close this window/page</small>
                <a class="d-block" href="/payment/success">Go back to Dashboard</a>
            </div>
            <div v-else>
                <a v-bind:href="'http://localhost:8080/orders/' + order_id" class="btn btn-primary">View your Order</a>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios'
    import { FIREBASE } from '../config'
    import { orderCollection, restaurantCollection } from '../firebase-config'

    export default {
        data() {
            return {
                loading: true,
                order_id: this.$route.query.order_id,
                is_mobile: this.$route.query.mobile && this.$route.query.mobile == "true" ? true : false
            }
        },

        created() {
            this.$store.commit("showLoader");
            orderCollection.doc(this.order_id).get().then((result) => {
                if (!result.exists) {
                    alert("This payment is invalid");
                    window.close();
                }
                
                let order = { id: result.id, ...result.data()};

                restaurantCollection.doc(order.restaurant_id).get().then(resto_result => {
                    console.log("RestaurantResult", resto_result);

                    if (!resto_result.exists) {
                        alert("No Ordered found");
                        return false;
                    }

                    let restaurant = { id: resto_result.id, ...resto_result.data()};

                    this.sendNotification(restaurant, order.menu_orders.name).then(notify => {
                        console.log(notify);
                        this.$store.commit("hideLoader");
                        this.loading = false;
                    });
                    
                });

            });
        },

        methods: {
            sendNotification: function(restaurant, menu_order_name) {
                return axios.post(
                    'https://fcm.googleapis.com/fcm/send', 
                    {
                        notification: {
                            body: "New order",
                            title: "There's new order " + menu_order_name
                        },
                        priority: "high",
                        data: {
                            restaurantId: restaurant.id,
                            body: "New order",
                            title: "There's new order " + menu_order_name
                        },
                        click_action: "FLUTTER_NOTIFICATION_CLICK",
                        to: restaurant.notification_token
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            'Authorization': "key=" + FIREBASE.cloudMessaging.serverKey,
                        }
                    }
                );
            },

            catchError: function(err) {
                console.log(err);
                alert("Something went wrong");
                if (err.response) {
                    console.log(err.response.data)
                }
            },
        }
    }
</script>