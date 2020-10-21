<template>
    <div>

    </div>
</template>

<script>
    import firebase from 'firebase'
    // import qs from 'querystring'
    // import axios from 'axios'

    import { userCollection, orderCollection } from '../firebase-config'
    // import { PAYPAL } from '../config'

    export default {
        created() {
            this.$session.start();
            
            userCollection.doc(this.$session.get("auid")).get().then(
                (auth) => {
                    if (auth.empty) {
                        alert("User not Found");
                        this.$router.replace({name: "Dashboard"});
                    }

                    this.auth = {id: auth.id, ...auth.data()};

                    orderCollection.add({
                        restaurant_id: "",
                        user_id: this.auth.id,
                        menu_orders: {
                            name: "Chicken joy",
                            price: 75
                        },
                        status: 1,
                        ordered_time: firebase.firestore.Timestamp.fromDate(new Date()),
                        restaurant_pick_time: null,
                        rider_pick_time: null,
                        rider_pick_up_time: null,
                        delivered_time: null,
                        delivery_fee: 100,
                        rider_id: null,
                        reason: "",
                        chats: [],
                        customer_location: new firebase.firestore.GeoPoint(this.auth.location.latitude, this.auth.location.longitude),
                        payment: {
                            method: "paypal",
                            status: "pending",
                            details: null
                        }
                    }).then((result) => {
                        if (!result.id) {
                            alert("Something went wrong. (Placing order). Please try again");
                            return false;
                        }
                        alert("Successfully Created");
                        console.log(result);

                        this.$router.replace("/payment/" + result.id + "/paypal");
                    }).catch((err) => {
                        alert("Something went wrong. Failed to create order");
                        console.log(err);
                    });

                    
                }
            );

        },
        methods: {
            /* getPaypalToken: function() {
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
            createPaypelOrder: function(token) {
                return axios.post(
                    "https://api.sandbox.paypal.com/v2/checkout/orders", 
                    {
                        intent: "CAPTURE",
                        purchase_units: [
                            {
                                amount: {
                                    currency_code: "PHP",
                                    value: "75.00"
                                }
                            }
                        ],
                        application_context: {
                            brand_name: "Let's Bee",
                            return_url:'http://localhost:8080/payment/paypal/return',
                            cancel_url:'http://localhost:8080/payment/paypal/cancel'
                        }
                    },
                    {
                        headers: {
                            'Content-Type':'application/json',
                            'Authorization': "Bearer " + token.data.access_token,
                        },
                    }
                );
            } */
        }
    }
</script>