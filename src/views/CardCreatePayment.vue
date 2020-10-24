<template>
    <div>
        <h1 class="text-center">Debit/Credit Card Checkout Payment</h1>

        <form class="form-signin" @submit.prevent="submitPayment">
            
            <div class="form-group">
                <label for="card_number" >Card Number</label>
                <input type="text" name="card_number" id="card_number" class="form-control" required v-model="details.card_number" @keypress="isNumber($event)">
            </div>
            
            <label for="expire_month">Expires</label>

            <div class="form-row">
                <div class="col">
                    <select name="expire_month" id="expire_month" class="form-control" v-model="details.exp_month">
                        <option disabled selected>Month</option>
                        <option>01</option>
                        <option>02</option>
                        <option>03</option>
                        <option>04</option>
                        <option>05</option>
                        <option>06</option>
                        <option>07</option>
                        <option>08</option>
                        <option>09</option>
                        <option>10</option>
                        <option>11</option>
                        <option>12</option>
                    </select>
                </div>
                <div class="col">
                    <select name="expire_year" id="expire_year" class="form-control" v-model="details.exp_year">
                        <option disabled selected>Month</option>
                        <option>2020</option>
                        <option>2021</option>
                        <option>2022</option>
                        <option>2023</option>
                        <option>2024</option>
                        <option>2025</option>
                        <option>2026</option>
                        <option>2027</option>
                        <option>2028</option>
                        <option>2029</option>
                        <option>2030</option>
                        <option>2031</option>
                    </select>
                </div>
                <div class="col">
                    <input type="password" name="cvc" id="cvc" class="form-control" v-model="details.cvc" placeholder="CVC">
                </div>
            </div>

            <div class="form-group">
                <label for="full_name" >Full Name</label>
                <input type="text" name="full_name" id="full_name" class="form-control" required v-model="billing.name">
            </div>

            <p class="font-weight-bold">Billing Address</p>

            <div class="form-group">
                <label for="email" >Email address</label>
                <input type="email" name="email" id="email" class="form-control"  required v-model="billing.email">
            </div>

            <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="text" id="phone" class="form-control" required v-model="billing.phone" @keypress="isNumber($event)">
            </div>

            <div class="form-group">
                <button class="btn btn-lg btn-primary btn-block w-100" type="submit">Continue</button>
            </div>
        </form>

    </div>
</template>

<script>
    import axios from 'axios'

    import { orderCollection } from '../firebase-config'
    import { PAYMONGO } from '../config'

    export default {
        data() {
            return {
                order_id: this.$route.params.order_id,
                mobileQuery: this.$route.query.mobile && this.$route.query.mobile == "true" ? "&mobile=true" : "",
                paymentIntentID: null,
                clientKey: null,
                details: {
                    card_number: null,
                    exp_month: null,
                    exp_year: null,
                    cvc: null,
                },
                billing: {
                    name: null,
                    email: null,
                    phone: null,
                },
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

                if (order.payment.method != "card") { 
                    alert("This Payment is not Card Payment");
                    window.close();
                    return false;
                }
                if (order.payment.status != "pending") {
                    alert("This payment is already processed");
                    window.close();
                    return false;
                }

                var total_price = order.menu_orders.price + order.delivery_fee;
                this.createPaymentIntent(total_price, order.menu_orders.name).then((intent_result) => {
                    console.log(intent_result);

                    this.paymentIntentID = intent_result.data.data.id;
                    this.clientKey = intent_result.data.data.attributes.client_key;

                    this.$store.commit("hideLoader");
                }, (this.catchError)).catch(this.catchError);

            }).catch(this.catchError);

        },

        methods: {

            isNumber: function(evt) {
                evt = (evt) ? evt : window.event;
                var charCode = (evt.which) ? evt.which : evt.keyCode;
                if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
                    evt.preventDefault();
                } else {
                    return true;
                }
            },

            createPaymentIntent: function(amount, order_name) {
                return axios.post(
                    "https://api.paymongo.com/v1/payment_intents",
                    {
                        data: {
                            attributes: {
                                amount: parseInt(amount + "00"),
                                payment_method_allowed: ["card"],
                                payment_method_options: {
                                    card: {
                                        request_three_d_secure: "any"
                                    }
                                },
                                description: "Ordered " + order_name,
                                currency: "PHP"
                            }
                        }
                    },
                    {
                        headers: {
                            "Content-Type": "application/json"
                        },
                        auth: {
                            username: PAYMONGO.secretKey,
                            password: PAYMONGO.secretKey
                        }
                    }
                );
            },

            submitPayment: function() {
                this.$store.commit("showLoader");

                this.createPaymentMethod().then((method_result) => {
                    console.log(method_result);

                    this.attachPayment(method_result.data.data.id).then((attach_result) => {
                        console.log(attach_result);
                        var paymentIntent = attach_result.data.data;
                        var paymentIntentStatus = paymentIntent.attributes.status;
                        
                        if (paymentIntentStatus === 'awaiting_next_action') {
                            // Render your modal for 3D Secure Authentication since next_action has a value. You can access the next action via paymentIntent.attributes.next_action.

                            // this.secureAuthentication().then((secure_result) => {

                            // });

                            window.location = paymentIntent.attributes.next_action.redirect.url;

                        } else if (paymentIntentStatus === 'succeeded') {
                            
                            this.updateOrder(paymentIntent.id, paymentIntent.attributes.client_key).then((update_result) => {
                                this.$store.commit("hideLoader");
                                console.log(update_result);

                                window.location = "/payment/card/success?order_id=" + this.order_id + this.mobileQuery; 
                            });

                        } else if(paymentIntentStatus === 'awaiting_payment_method') {

                            alert(paymentIntent.attributes.last_payment_error);
                        }  else if (paymentIntentStatus === 'processing'){
                            // You need to requery the PaymentIntent after a second or two. This is a transitory status and should resolve to `succeeded` or `awaiting_payment_method` quickly.
                            this.getPaymentIntent();
                        }


                    }).catch(this.catchError);

                }).catch(this.catchError);
            },

            createPaymentMethod: function() {
                return axios.post(
                    "https://api.paymongo.com/v1/payment_methods",
                    {
                        data: {
                            attributes: {
                                details: {
                                    card_number: this.details.card_number,
                                    exp_month: parseInt(this.details.exp_month),
                                    exp_year: parseInt(this.details.exp_year),
                                    cvc: this.details.cvc
                                },
                                billing: this.billing,
                                type: "card"
                            }
                        }
                    },
                    {
                        headers: {
                            "Content-Type": "application/json"
                        },
                        auth: {
                            username: PAYMONGO.secretKey,
                            password: PAYMONGO.secretKey
                        }
                    }
                );
            },

            attachPayment: function(paymentMethodID) {
                return axios.post(
                    "https://api.paymongo.com/v1/payment_intents/" + this.paymentIntentID + "/attach",
                    {
                        "data": {
                        "attributes": {
                            "client_key": this.clientKey,
                            "payment_method": paymentMethodID
                            }
                        }
                    },
                    {
                        headers: {
                            "Content-Type": "application/json"
                        },
                        auth: {
                            username: PAYMONGO.secretKey,
                            password: PAYMONGO.secretKey
                        }
                    }
                )
            },

            // secureAuthentication: function() {

            // },

            updateOrder: function(paymentIntentID, clientKey) {
                return orderCollection.doc(this.order_id).update({
                    payment: {
                        method: "card",
                        status: "paid",
                        details: {
                            orderID: paymentIntentID,
                            clientKey: clientKey
                        }
                    }
                })
            },

            getPaymentIntent: function() {
                setTimeout(function () {
                    alert('VIDEO HAS STOPPED');
                }, 2000);
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