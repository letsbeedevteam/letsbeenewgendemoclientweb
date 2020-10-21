<template>
    <div class="text-center">
        <div v-if="processing">
            <h1>Processing...</h1>
            <img src="/images/loader.gif" alt="loading">
        </div>
        <div v-else>
            <h1>Payment has been accepted</h1>
            <button type="button" class="btn btn-primary" @click="closeWindow"> Close</button>
        </div>
    </div>
</template>

<script>
    import { FIREBASE, PAYPAL } from '../config'
    import axios from 'axios'
    import qs from 'querystring'

    import { orderCollection, restaurantCollection } from '../firebase-config'

    export default {
        data() {
            return {
                processing: true,
                token: this.$route.query.token,
                payer_id: this.$route.query.PayerID,
                order_id: this.$route.query.order_id
            }
        },
        created() {

            
            var orderRef = orderCollection.doc(this.order_id);
            orderRef.get().then((result) => {
                console.log("OrderResult", result);

                if (!result.exists) {
                    alert("No Ordered found");
                    return false;
                }

                let order = { id: result.id, ...result.data()};

                console.log(order);

                this.getPaypalToken().then((token) => {
                    console.log(token);

                    this.getOrder(token.data.access_token).then((order_result) => {
                        console.log(order_result);
                        
                        if (order_result.data.status != "APPROVED") {
                            alert("Payment is not approved");
                            return false;
                        }

                        this.captureOrder(token.data.access_token).then((authorize_result) => {
                            console.log(authorize_result);

                            if (authorize_result.data.status != "COMPLETED") {
                                alert("Payment is not yet completed");
                                return false;
                            }

                            this.updateOrderPayment(orderRef).then(update => {
                                console.log(update);

                                this.processing = false;

                                this.sendNotification(order.restaurant_id, order.menu_orders.name).then(notify => {
                                    console.log(notify);
                                });

                            });

                        }).catch(this.catchError);

                    }).catch(this.catchError);

                }).catch(this.catchError);

            }).catch(this.catchError);

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
            
            sendNotification: function(restaurant_id, menu_order_name) {
                restaurantCollection.doc(restaurant_id).get().then(resto_result => {
                    console.log("RestaurantResult", resto_result);

                    if (!resto_result.exists) {
                        alert("No Ordered found");
                        return false;
                    }

                    let restaurant = { id: resto_result.id, ...resto_result.data()};
                    
                    return axios.post(
                        'https://fcm.googleapis.com/fcm/send', 
                        {
                            notification: {
                                body: "New order",
                                title: "There's new order " + menu_order_name
                            },
                            priority: "high",
                            data: {
                                restaurantId: restaurant_id,
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
                });
            },

            closeWindow: function() {
                window.close();
            },
            
            catchError: function(err) {
                console.log(err);
                if (err.response) {
                    console.log(err.response.data)
                }
            }
            /* checkPayment: function(result) {
                return axios.get(
                    "https://api.sandbox.paypal.com/v1/payments/payment/" + this.payment_id, 
                    {
                        headers: {
                            'Content-Type':'application/json',
                            'Authorization': "Bearer " + this.token,
                        },
                    }
                )
            },
            validatePayment: function(result) {
                return axios.post(
                    "https://api.sandbox.paypal.com/v1/payments/payment/" + this.payment_id + "/execute", 
                    {
                        payer_id: this.payer_id
                    },
                    {
                        headers: {
                            'Content-Type':'application/json',
                            'Authorization': "Bearer " + this.token,
                        },
                    }
                )
            },
            authorizePayment: function(result) {
                return axios.post(
                    "https://api.sandbox.paypal.com/v1/payments/orders/O-0NR488530V5211123/authorize",
                    // "https://api.sandbox.paypal.com/v1/payments/payment/" + this.payment_id + "/execute", 
                    {
                        payer_id: this.payer_id
                    },
                    {
                        headers: {
                            'Content-Type':'application/json',
                            'Authorization': "Bearer " + this.token,
                        },
                    }
                )
            } */
        }
    }
</script>