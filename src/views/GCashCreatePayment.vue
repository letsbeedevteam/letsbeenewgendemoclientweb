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
            is_mobile: this.$route.query.mobile && this.$route.query.mobile == "true" ? true : false,
            mobileQuery: this.is_mobile ? "&mobile=true" : "",
        }
    },
    created() {
        var orderRef = orderCollection.doc(this.order_id);
        orderRef.get().then((result) => {
            if (!result.exists) {
                alert("This payment is invalid");
                window.location = NETWORK_URL + "/payment/success";
            }
            
            let order = { id: result.id, ...result.data()};

            if (order.payment.method != "gcash") {
                alert("This payment is invalid. please close this page to continue browsing");
                window.location = NETWORK_URL + "/payment/success";
            }

            if (order.payment.status != "pending") {
                alert("This payment has been processed. please close this page to continue browsing");
                window.location = NETWORK_URL + "/payment/success";
            }

            let total_price = order.delivery_fee + order.menu_orders.price;
            this.createSource(order.id, total_price).then((source_result) => {

                this.updateOrder(orderRef, source_result.data.data.id).then(() => {
                    alert("Successfull created GCASH payment");

                    window.location = source_result.data.data.attributes.redirect.checkout_url;
                }).catch(this.catchFirebase); // update order

            }).catch(this.catchPaymongo); // create source
            
        }).catch(this.catchFirebase); // get order
    },

    methods: {
        createSource: function(order_id, amount) {
            return axios.post(
                "https://api.paymongo.com/v1/sources",
                {
                    data: {
                        attributes: {
                            amount: parseInt(amount + "00"),
                            redirect: {
                                success: NETWORK_URL + "/payment/gcash/success?order_id=" + order_id + this.mobileQuery,
                                failed: NETWORK_URL + "/payment/gcash/failed?order_id=" + order_id + this.mobileQuery,
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