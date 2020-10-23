<template>
    <div class="text-center">
        <img src="/images/loading.gif" alt="loading">
    </div>
</template>

<script>
    import { orderCollection } from '../firebase-config'
    import { PAYPAL, NETWORK_URL } from '../config'
    import axios from 'axios'
    import qs from 'querystring'

    export default {
        data() {
            return {
                order_id: this.$route.params.order_id,
                is_mobile: this.$route.query.mobile && this.$route.query.mobile == "true" ? true : false
            }
        },
        created() {
            
            var orderRef = orderCollection.doc(this.order_id);
            orderRef.get().then((result) => {
                if (!result.exists) {
                    alert("This payment is invalid");
                    window.close();
                }
                
                let order = { id: result.id, ...result.data()};

                if (order.payment.method != "paypal") { 
                    alert("This Payment is not paypal");
                    window.close();
                    return false;
                }
                if (order.payment.status != "pending") {
                    alert("This payment is already processed");
                    window.close();
                    return false;
                }

                this.getPaypalToken().then((token) => {
                    console.log("GetPaypalToken", token);

                    var total_price = order.menu_orders.price + order.delivery_fee;
                    this.createOrder(token.data.access_token, order.id, total_price).then(order_result => {
                        console.log("CreatePaypalOrder", order_result);

                        this.updateOrderPayment(orderRef, order_result.data.id).then(update_result => {
                            console.log("UpdateOrderPaypalID", update_result);

                            alert("Successfully create a paypal payment");
                            window.location = "https://www.sandbox.paypal.com/checkoutnow?token=" + order_result.data.id;

                        }, (this.catchError)).catch(this.catchError);

                    }, (this.catchError)).catch(this.catchError);

                }, (this.catchError)).catch(this.catchError);

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
            createOrder: function(access_token, order_id, total_price) {
                var mobileQuery = this.is_mobile ? "&mobile=true" : "";
                return axios.post(
                    "https://api.sandbox.paypal.com/v2/checkout/orders",
                    {
                        intent: "CAPTURE",
                        purchase_units: [
                            {
                                amount: {
                                    currency_code: "PHP",
                                    value: total_price
                                }
                            }
                        ],
                        application_context: {
                            brand_name: "Let's Bee",
                            return_url: NETWORK_URL + "/payment/paypal/return?order_id=" + order_id + mobileQuery,
                            cancel_url: NETWORK_URL + "/payment/paypal/cancel?order_id=" + order_id + mobileQuery,
                        }
                    },
                    {
                        headers: {
                            'Content-Type':'application/json',
                            'Authorization': "Bearer " + access_token,
                        },
                    }
                );
            },

            updateOrderPayment: function(orderRef, order_id) {
                return orderRef.update({
                    payment: {
                        method: "paypal",
                        status: "pending",
                        details: {
                            orderID: order_id
                        }
                    }
                });
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