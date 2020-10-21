<template>
    <div>
        <div v-if="processing">
            <h1 class="text-center">Processing...</h1>
        </div>
        <div v-else>
            <h1 class="text-center">Payment has been accepted</h1>
            <button type="button" class="btn btn-primary" @click="closeWindow"> Close</button>
        </div>
    </div>
</template>

<script>
    import { PAYPAL } from '../config'
    import axios from 'axios'
    import qs from 'querystring'

    import { orderCollection } from '../firebase-config'

    export default {
        data() {
            return {
                processing: true,
                token: this.$route.query.token,
                payer_id: this.$route.query.PayerID,
            }
        },
        created() {

            orderCollection.where("payment.method", "==", "paypal").where("payment.details.orderID", "==", this.token).get().then((result) => {
                console.log(result);

                if (result.empty) {
                    alert("No Ordered found");
                    return false;
                }

                let orders = result.docs.map(order => { return { id: order.id, ...order.data() } });

                console.log(orders);

                this.getPaypalToken().then((token) => {
                    console.log(token);

                    this.getOrder(token.data.access_token).then((order_result) => {
                        console.log(order_result);
                        
                        if (!order_result.data.status == "APPROVED") {
                            alert("Payment is not approved");
                            return false;
                        }

                        this.captureOrder(token.data.access_token).then((authorize_result) => {
                            console.log(authorize_result);

                            if (authorize_result.data.status != "COMPLETED") {
                                alert("Payment is not yet completed");
                                return false;
                            }

                            this.processing = false;

                            orderCollection.doc(orders[0].id).update({
                                payment: {
                                    method: "paypal",
                                    status: "paid",
                                    details: {
                                        orderID: this.token,
                                        payerID: this.payer_id,
                                    }
                                }
                            })
                        });

                    });
                })
            });
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

            closeWindow: function() {
                window.close();
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