<template>
    <div class="container" >

        <div class="row">
            <div class="col-8" >
                <div v-if="restaurant">
                    <h1>{{ restaurant.name }}</h1>
                    <p class="mb-5" v-html="restaurant.description"></p>

                    <h3> Menus</h3>
                    <table class="table table-stripped">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="menu in restaurant.menus" :key="menu.name">
                                <td>{{ menu.name }} </td>
                                <td><span>&#8369;</span> {{ menu.price }} </td>
                                <td><button type="button" v-bind:class="[select.class, select.disabled ? 'disabled' : '']" @click="selectOrder(menu.name, menu.price)">Select</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="col-4">
                <h3>Confirmation</h3>

                <table class="table">
                    <tbody>
                        <tr>
                            <td class="text-left">{{ order.name }}</td>
                            <td class="text-right"><span>&#8369;</span> {{ (order.price).toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td class="text-left">Delivery Fee</td>
                            <td class="text-right"><span>&#8369;</span> {{ (order.delivery_fee).toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td class="text-left">Total</td>
                            <td class="text-right"><span>&#8369;</span> {{ (order.total_price).toFixed(2) }}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="mt-3">
                    <button type="submit" class="btn btn-success w-100 p-2 mb-3" @click="orderByDelivery">Cash on Delivery</button>
                    <div id="paypal-button-container"></div>
                </div>
            </div>
        </div>


    </div>
</template>

<script>
    import firebase from 'firebase'
    import axios from 'axios'
    import GoogleMapsApiLoader from 'google-maps-api-loader'
    import { FIREBASE, PAYPAL, GOOGLE } from '../config'
    import { orderCollection, restaurantCollection, userCollection } from '../firebase-config'

    export default {
        data() {
            return {
                restaurant_id: this.$route.params.restaurant_id,
                restaurant: null,
                auth: null,
                order: {
                    name: "------",
                    price: 0,
                    delivery_fee: 0,
                    total_price: 0
                },
                google: null,
                map: null,
                select: {
                    class: "btn btn-primary",
                    disabled: true
                }
            }
        },

        created() {
            restaurantCollection.doc(this.restaurant_id).get().then(
                (result) => {
                    if (result.empty) {
                        alert("Restaurant Not Found");
                        this.$router.replace({name: "Dashboard"});
                    }
                    this.restaurant = {id: result.id, ...result.data()};
                }
            );
            this.$session.start();
            
            userCollection.doc(this.$session.get("auid")).get().then(
                (result) => {
                    if (result.empty) {
                        alert("User not Found");
                        this.$router.replace({name: "Dashboard"});
                    }

                    this.auth = {id: result.id, ...result.data()};
                }
            );
        },

        async mounted() {

            if (!document.getElementById("paypalScript")) {
                let script = document.createElement('script');
                script.src = 'https://www.paypal.com/sdk/js?client-id=' + PAYPAL.clientId + '&currency=PHP';
                script.id = "paypalScript";
                script.addEventListener("load", this.initializePaypal)
                document.head.appendChild(script);
            } else {
                document.getElementById("paypalScript").addEventListener("load", this.initializePaypal);
            }

            this.google =  await GoogleMapsApiLoader({
                apiKey: GOOGLE.map.key
            }).catch(err => {
                console.log(err);
                if (err.response) {
                    console.log(err.response);
                }
            });

            this.select.disabled = false;
        },

        methods: {
            initializePaypal: function() {
                console.log("paypal Loaded");
                var _this = this;
                window.paypal.Buttons({
                    createOrder: function(data, actions) {
                        if (_this.order.total_price <= 0) { 
                            return false;
                        }
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    currency_code: "PHP",
                                    value: _this.order.total_price,
                                },
                            }]
                        });
                    },
                    onApprove: function(data, actions) {
                        return actions.order.capture().then(function(details) {
                            _this.createOrder("paypal", "paid", {
                                orderID: data.orderID,
                                payerId: data.payerID,
                                facilitatorAccessToken: data.facilitatorAccessToken,
                                status: details.status
                            })
                        });
                    },
                    onError: function (err) {
                        alert("Something went wrong, please pick a menu before clicking the paypal button");
                        console.log(err);
                    }
                }).render('#paypal-button-container');
            },
            selectOrder: function(menu_name, menu_price) {
                
                if (this.auth.location.latitude == 0 && this.auth.location.longitude == 0) {
                    alert("Please select your address first before ordering. (check the dropdown on the top right of the window)");
                    return false;
                }

                var _this = this;
                var matrix = new this.google.maps.DistanceMatrixService();

                matrix.getDistanceMatrix(
                    {
                        origins: [new this.google.maps.LatLng(this.auth.location.latitude, this.auth.location.longitude)],
                        destinations: [new this.google.maps.LatLng(this.restaurant.location.latitude , this.restaurant.location.longitude)],
                        travelMode: this.google.maps.TravelMode.DRIVING,
                    }, 
                    function(response, status) {
                        
                        if (status != "OK") {
                            alert("Invalid Request, Google Map can't get the distance, please try again");
                            return false;
                        }

                        var deliveryFee = Math.ceil(response.rows[0].elements[0].distance.value / 100) * 5;

                        _this.order = {
                            name: menu_name,
                            price: menu_price,
                            delivery_fee: deliveryFee,
                            total_price: (deliveryFee + menu_price),
                        }

                    }
                );
            },
            orderByDelivery: function() {
                if (this.auth.location.latitude == 0 && this.auth.location.longitude == 0) {
                    alert("Please select your address first before ordering. (check the dropdown on the top right of the window)");
                    return false;
                }

                orderCollection.where("user_id", "==", this.auth.id).where("status", "in", [1, 2, 4,]).get().then(
                    (result) => {
                        if (!result.empty) {
                            alert("Invalid Request. You're order still on proccess"); 
                            return false;
                        } 
                        this.createOrder("cod", "pending", null)
                    }
                );
            },
            
            createOrder: async function(payment_method, payment_status, payment_details) {
                orderCollection.add({
                    restaurant_id: this.restaurant_id,
                    user_id: this.auth.id,
                    menu_orders: {
                        name: this.order.name,
                        price: this.order.price
                    },
                    status: 1,
                    ordered_time: firebase.firestore.Timestamp.fromDate(new Date()),
                    restaurant_pick_time: null,
                    rider_pick_time: null,
                    rider_pick_up_time: null,
                    delivered_time: null,
                    delivery_fee: this.order.delivery_fee,
                    rider_id: null,
                    reason: "",
                    chats: [],
                    customer_location: new firebase.firestore.GeoPoint(this.auth.location.latitude, this.auth.location.longitude),
                    payment: {
                        method: payment_method,
                        status: payment_status,
                        details: payment_details /* -> {
                                paymentID: ""
                                orderID: data.orderID,
                                payerId: data.payerID,
                                facilitatorAccessToken: data.facilitatorAccessToken,
                                status: details.status} */
                    }
                }).then((result) => {
                    if (!result.id) {

                        alert("Something went wrong. (Placing order). Please try again");
                        return false;
                    }
                    
                    alert("Successfully ordered\n\nStatus: " + payment_status);

                    this.sendNotification();
                    this.$router.push("/orders/" + result.id);
                }).catch((err) => {
                    alert("Something went wrong. (Placing order). Please try again");
                    console.log(err);
                });
            },
            sendNotification: function() {
                axios.post(
                    'https://fcm.googleapis.com/fcm/send', 
                    {
                        notification: { title: "New order", body: `There's new order (${this.order.name})`},
                        priority: "high",
                        click_action: "FLUTTER_NOTIFICATION_CLICK",
                        to: this.restaurant.notification_token
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
        },
        beforeDestroy() {
            this.restaurant = null;
            this.auth = null;
            this.order = { name: "------", price: 0, delivery_fee: 0, total_price: 0 };
            this.google = null;
            this.map = null;
        }
    }
</script>