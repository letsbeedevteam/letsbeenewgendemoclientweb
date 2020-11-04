<template>
    <div class="text-center">
        <div v-if="processing">
            <h1>Processing...</h1>
            <img src="/images/loading.gif" alt="loading">
        </div>
        <div v-else>
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
import { FIREBASE, PAYPAL, NETWORK_URL } from '../config'
import axios from 'axios'
import qs from 'querystring'

import { orderCollection, restaurantCollection } from '../firebase-config'

export default {
    data() {
        return {
            processing: true,
            token: this.$route.query.token,
            payer_id: this.$route.query.PayerID,
            order_id: this.$route.query.order_id,
            is_mobile: this.$route.query.mobile && this.$route.query.mobile == "true" ? true : false,
            mobileQuery: null
        }
    },
    created() {
        this.mobileQuery = this.is_mobile ? "&mobile=true" : "";

        var orderRef = orderCollection.doc(this.order_id);
        orderRef.get().then((result) => {

            if (!result.exists) {
                alert("No Ordered found");
                return false;
            }

            let order = { id: result.id, ...result.data()};

            this.getPaypalToken().then((token) => {

                this.getOrder(token.data.access_token).then((order_result) => {
                    
                    if (order_result.data.status != "APPROVED") {
                        alert("Payment is not approved");
                        return false;
                    }

                    this.captureOrder(token.data.access_token).then((authorize_result) => {
                        if (authorize_result.data.status != "COMPLETED") {
                            alert("Payment is not yet completed");
                            return false;
                        }

                        this.updateOrderPayment(orderRef).then(() => {
                            
                            restaurantCollection.doc(order.restaurant_id).get().then(resto_result => {
                                console.log("RestaurantResult", resto_result);

                                if (!resto_result.exists) {
                                    alert("No Ordered found");
                                    return false;
                                }

                                let restaurant = { id: resto_result.id, ...resto_result.data()};
                                
                                this.sendNotification(restaurant, order.menu_orders.name).then(notify => {
                                    console.log(notify);
                                    this.processing = false;
                                    
                                }).catch(this.catchNotify); // send notification

                            }).catch(this.catchNotify); // get restaurant

                        }).catch(this.catchFirebase); // update order

                    }).catch(this.catchPaypal); // get order payment

                }).catch(this.catchPaypal); // get order payment

            }).catch(this.catchPaypal); // get token

        }).catch(this.catchFirebase); // get order

    },

    methods: {
        getPaypalToken: function() {
            return axios.post(
                "https://api.sandbox.paypal.com/v1/oauth2/token", 
                qs.stringify({"grant_type":"client_credentials"}),
                {
                    headers: {
                        'Accept': 'application/json', 
                        'Accept-Language': 'en_US',
                        'Content-Type':'application/x-www-form-urlencoded',
                        'Access-Control-Allow-Origin': '*', 
                    },
                    auth: {
                        username: PAYPAL.clientId,
                        password: PAYPAL.secretId,
                    }
                }
            );
        },

        getOrder: function(token) {
            return axios.get(
                "https://api.sandbox.paypal.com/v2/checkout/orders/" + this.token,
                {
                    headers: {
                        'Content-Type':'application/json',
                        'Authorization': "Bearer " + token,
                    },
                }
            );
        },

        captureOrder: function(token) {
            return axios.post(
                "https://api.sandbox.paypal.com/v2/checkout/orders/" + this.token + "/capture",
                {},
                {
                    headers: {
                        'Content-Type':'application/json',
                        'Authorization': "Bearer " + token,
                    },
                }
            )
        },

        updateOrderPayment: function(orderRef) {
            return orderRef.update({
                payment: {
                    method: "paypal",
                    status: "paid",
                    details: {
                        orderID: this.token,
                        payerID: this.payer_id,
                    }
                }
            });
        },
        
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
            ).then(function(response) {
                console.log(response);
            });
        },

        catchNotify: function(err) {
            console.log(err);
            alert("Something went wrong. Failed to notify the restaurant.\nBut your order is already paid and already on process.");
            this.processing = false;
        },

        catchPaypal: function(err) {
            console.log(err);
            alert("Something went wrong. Failed to create Paypal payment");
            window.location = NETWORK_URL + "/payment/paypal/cancel?order_id=" + this.order_id + this.mobileQuery;
        },

        catchFirebase: function(err) {
            console.log(err);
            alert("Something went wrong. Failed to load google firebase");
            window.location = NETWORK_URL + "/payment/paypal/cancel?order_id=" + this.order_id + this.mobileQuery;
        },
        
    }
}
</script>