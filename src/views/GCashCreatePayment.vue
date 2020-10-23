<template>
    <div class="text-center">
        <img src="/images/loading.gif" alt="loading">
    </div>
</template>

<script>
    import axios from 'axios'

    import { NETWORK_URL, PAYMONGO } from '../config'
    import { orderCollection } from '../firebase-config'

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

                if (order.payment.method != "gcash") {
                    alert("This payment is invalid. please close this page to continue browsing");
                    return false;
                }

                if (order.payment.status != "pending") {
                    alert("This payment has been processed. please close this page to continue browsing");
                    return false;
                }

                let total_price = order.delivery_fee + order.menu_orders.price;
                this.createSource(order.id, total_price).then(
                    source_result => {
                        console.log(source_result);

                        this.updateOrder(orderRef, source_result.data.data.id).then(
                            (update_result) => {
                                console.log(update_result);
                                alert("Successfull created GCASH payment");
                                window.location = source_result.data.data.attributes.redirect.checkout_url;
                            },
                            (this.catchError)
                        );
                    },
                    (this.catchError)
                    
                ).catch(this.catchError);
                
            }).catch(this.catchError);
        },

        methods: {
            createSource: function(order_id, amount) {
                var mobileQuery = this.is_mobile ? "&mobile=true" : "";
                return axios.post(
                    "https://api.paymongo.com/v1/sources",
                    {
                        data: {
                            attributes: {
                                amount: parseInt(amount + "00"),
                                redirect: {
                                    success: NETWORK_URL + "/payment/gcash/success?order_id=" + order_id + mobileQuery,
                                    failed: NETWORK_URL + "/payment/gcash/failed?order_id=" + order_id + mobileQuery,
                                },
                                billing: {
                                    address: {
                                        line1: "Yukon",
                                        state: "Pampanga",
                                        postal_code: "2013",
                                        city: "Angeles",
                                        country: "PH"
                                    },
                                    name: "John Doe",
                                    phone: "09664489094",
                                    email: "letsbeedevteam@gmail.com"
                                },
                                type: "gcash",
                                currency: "PHP"
                            }
                        }
                    },
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

            updateOrder: function(orderRef, order_id) {
                return orderRef.update({
                    payment: {
                        method: "gcash",
                        status: "pending",
                        details: {
                            orderID: order_id
                        }
                    }
                })
            },
             
            catchError: function(err) {
                console.log(err);
                alert(err);
                if (err.response) {
                    console.log(err.response.data)
                }
            },
        }

    }
</script>