<template>
    <div>

    </div>
</template>

<script>
    import { orderCollection } from '../firebase-config'
    import { PAYPAL } from '../config'
    import axios from 'axios'
    import qs from 'querystring'

    export default {
        data() {
            return {
                order_id: this.$route.params.order_id,
            }
        },
        created() {

            orderCollection.doc(this.order_id).get().then(
                (result) => {
                    if (!result.exists) {
                        alert("This payment is invalid");
                        window.close();
                    }
                    
                    let order = { id: result.id, ...result.data()};
console.log(order);
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
                    if (!order.payment.details.orderID) {
                        alert("Invalid Request");
                        window.close();
                        return false;
                    }

                    this.getPaypalToken().then((token) => {
                        console.log(token);

                        this.checkOrder(token, order).then(result => {
                            console.log(result);

                            if (result.data.status == "CREATED") {
                                console.log(JSON.stringify(token));
                                console.log(JSON.stringify(result));
                                alert("pause here");
                                // this.$router.replace("https://www.sandbox.paypal.com/checkoutnow?token=" + order.payment.details.orderID);
                                window.location = "https://www.sandbox.paypal.com/checkoutnow?token=" + order.payment.details.orderID;
                            } else {
                                alert("status is not 'CREATED'");

                            }
                        });
                    }).catch((err) => {

                        console.log(err);
                        if (err.response) {
                            console.log(err.response.data)
                        }
                    })

                }
            )
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
            checkOrder: function(token, order) {
                
                return axios.get(
                    "https://api.sandbox.paypal.com/v2/checkout/orders/" + order.payment.details.orderID,
                    {
                        headers: {
                            'Content-Type':'application/json',
                            'Authorization': "Bearer " + token.data.access_token,
                        },
                    }
                );

            },

        }
    }
</script>