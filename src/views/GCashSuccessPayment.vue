<template>
    <div class="text-center">
        <div v-if="processing">
            <h1>Processing...</h1>
            <img src="/images/loading.gif" alt="loading">
        </div>
        <div v-else>
            <h1>Payment has been accepted</h1>
            <div v-if="is_mobile">
                <small class="d-block">You can now safely close this window/page</small>
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

import { orderCollection, restaurantCollection } from '../firebase-config'
import { PAYMONGO, FIREBASE, NETWORK_URL } from '../config'

export default {
    data() {
        return {
            processing: true,
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
                alert("This payment is invalid");
                window.close();
            }
            
            let order = { id: result.id, ...result.data()};

            if (order.payment.method != "gcash") {
                alert("This payment is invalid. please close this page to continue browsing");
                return false;
            }

            if (!order.payment.details.orderID) {
                alert("This payment is invalid. No orderID has been made.");
                return false;
            }

            this.getGCashOrder(order.payment.details.orderID).then((source_result) => {
                console.log(source_result);
                
                if (source_result.data.data.attributes.status != "chargeable") {
                    alert("This payment is invalid. The status is invalid. (" + source_result.data.data.attributes.status + ")");
                    return false;
                }

                let total_price = order.delivery_fee + order.menu_orders.price;
                this.authorizePayment(order.payment.details.orderID, total_price, order.menu_orders.name).then((auth_result) => {
                    console.log(auth_result);

                    if (auth_result.data.data.attributes.status != "paid") {
                        alert("This payment is invalidate. The GCash payment has been not accepted. (" + auth_result.data.data.attributes.status + ")");
                        return false;
                    }

                    this.updateOrder(orderRef, order.payment.details.orderID).then((update_result) => {
                        console.log(update_result);

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

                            }).catch(this.catchNotify);

                        }).catch(this.catchNotify);

                    }).catch(this.catchFirebase); // update order

                }).catch(this.catchPaymongo); // get authorize payment

            }).catch(this.catchPaymongo); // get order payment
            
        }).catch(this.catchFirebase); // get order
    },
    methods: {
        
        getGCashOrder: function(source_id) {
            return axios.get(
                "https://api.paymongo.com/v1/sources/" + source_id,
                {
                    headers: {
                        'Content-Type':'application/json',
                    },
                    auth: {
                        username: PAYMONGO.publicKey,
                        password: PAYMONGO.secretKey,
                    }
                }
            );
        },

        authorizePayment: function(source_id, amount, menu_order_name) {
            return axios.post(
                "https://api.paymongo.com/v1/payments",
                {
                    data: {
                        attributes: {
                            amount: parseInt(amount + "00"),
                            source: {
                                id: source_id,
                                type: "source"
                            },
                            currency: "PHP",
                            description: "Ordered " + menu_order_name,
                        }
                    }
                },
                {
                    headers: {
                        'Content-Type':'application/json',
                    },
                    auth: {
                        username: PAYMONGO.secretKey,
                        password: PAYMONGO.secretKey,
                    }
                }
            );
        },

        updateOrder: function(orderRef, order_id) {
            return orderRef.update({
                payment: {
                    method: "gcash",
                    status: "paid",
                    details: {
                        orderID: order_id
                    }
                }
            })
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
            );
            
        },

        catchNotify: function(err) {
            console.log(err);
            this.processing = false;
            alert("Something went wrong. Failed to notify the restaurant.\nBut your order is already paid and already on process.");
        },

        catchPaymongo: function(err) {
            console.log(err);
            alert("Something went wrong. Failed to load paymongo.");
            window.location = NETWORK_URL + "/payment/gcash/failed?order_id=" + this.order_id + this.mobileQuery;
        },

        catchFirebase: function(err) {
            console.log(err);
            alert("Something went wrong. Failed to load google firebase");
            window.location = NETWORK_URL + "/payment/gcash/failed?order_id=" + this.order_id + this.mobileQuery;
        },
    }
}
</script>