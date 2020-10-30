<template>
    <div class="container">
        <div class="mb-3">
            <h1 class="text-center">Order</h1>
            <div class="text-center"><small  v-if="order">ID: {{ order_id }}</small></div>
        </div>

        <div class="row" >
            <div class="col-8" v-if="order">

                <div class="box">
                    <h3>Ordered Menu</h3>
                    <table class="table table-nfbt mb-0">
                        <tbody>
                            <tr>
                                <td>{{ order.menu_orders.name }}</td>
                                <td><span>&#8369;</span> {{ order.menu_orders.price }}</td>
                            </tr>
                            <tr>
                                <td>Delivery Fee</td>
                                <td><span>&#8369;</span> {{ order.delivery_fee }}</td>
                            </tr>
                            <tr>
                                <td>Total</td>
                                <td><span>&#8369;</span> {{ order.menu_orders.price + order.delivery_fee }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="restaurant" class="box">
                    <h3>Restaurant</h3>
                    <table class="table table-nfbt mb-0">
                        <tbody>
                            <tr>
                                <td>Name</td>
                                <td>{{ restaurant.name }}</td>
                            </tr>
                            <tr v-if="restaurant_address">
                                <td>Address</td>
                                <td>{{ restaurant_address }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="box">
                    <h3>Payment</h3>
                    <table class="table table-nfbt mb-0">
                        <tbody>
                            <tr>
                                <td>Payment Method</td>
                                <td>{{ payments[order.payment.method] }}</td>
                            </tr>
                            <tr>
                                <td>Status</td>
                                <td>{{ paymentStatus[order.payment.status] }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="box">
                    <h3>Informations</h3>
                    <table class="table table-nfbt mb-0">
                        <tbody>
                            <tr>
                                <td>Ordered Time</td>
                                <td>{{ formatFBtimestamp(order.ordered_time) }}</td>
                            </tr>
                            <tr>
                                <td>Order status</td>
                                <td>{{ statuss[order.status] }}</td>
                            </tr>
                            <tr v-if="order.reason">
                                <td>Reason</td>
                                <td>{{ order.reason }}</td>
                            </tr>
                            <tr v-if="order.restaurant_pick_time">
                                <td>Restaurant Response Time</td>
                                <td>{{ formatFBtimestamp(order.restaurant_pick_time) }}</td>
                            </tr>
                            <tr v-if="order.rider_pick_time">
                                <td>Rider Response Time</td>
                                <td>{{ formatFBtimestamp(order.rider_pick_time) }}</td>
                            </tr>
                            <tr v-if="order.rider_pick_up_time">
                                <td>Rider Response Time</td>
                                <td>{{ formatFBtimestamp(order.rider_pick_up_time) }}</td>
                            </tr>
                            <tr v-if="order.delivered_time">
                                <td>Delivered Time</td>
                                <td>{{ formatFBtimestamp(order.delivered_time) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="order.rider_id && rider" class="box">
                    <h3>Rider Info</h3>
                    <table class="table table-nfbt mb-0">
                        <tbody>
                            <tr>
                                <td>Name</td>
                                <td>{{ (rider.name) ? rider.name : "" }}</td>
                            </tr>
                            <tr>
                                <td>Rating</td>
                                <td>&#9733; &#9733; &#9733; &#9733; &#9733;</td>
                            </tr>
                            <tr>
                                <td>Picture</td>
                                <td><img src="/images/Fadi-Yassmin.jpg" alt="" style="height: 50px;"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="card bg-light mb-3 w-100" v-if="order.rider_id && rider && Object.keys(rider).length > 0 && order.status != 7">
                    <div class="card-header">Chats</div>
                    <div class="card-body chat-box">
                        <div class="chat-messages">
                            <div v-for="chat in order.chats" :key="chat.created" class="chat-message">
                                <div v-if="chat.user_id == rider.id" class="text-left">
                                    <div class="chat-user-name">{{ rider.name }}</div>
                                    <div>{{ chat.message }}</div>
                                    <div class="chat-user-date">{{ formatFBtimestamp(chat.created_at) }}</div>
                                </div>
                                <div v-else class="text-right">
                                    <div class="chat-user-name">You </div>
                                    <div>{{ chat.message }}</div>
                                    <div class="chat-user-date">{{ formatFBtimestamp(chat.created_at) }}</div>
                                </div>
                            </div>
                        </div>
                        <form @submit.prevent="sendMessage" class="chat-input">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Message here" aria-label="Message here" v-model="message">
                                <div class="input-group-append">
                                    <button class="btn btn-primary" type="submit">Send</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div class="col-4">
                <div id="orderMap" ref="orderMap"></div>

                <!-- <div class="mt-3">
                    <button type="button" class="btn btn-primary" @click="updateDriverMarker"> Update driver marker</button>
                </div> -->
            </div>
        </div>
    </div>
</template>

<script>
import firebase from 'firebase'
import GoogleMapsApiLoader from 'google-maps-api-loader'

import { ORDER_STATUS, ORDER_PAYMENT, MONTH, PAYMENT_STATUS } from '../constant'
import { orderCollection, restaurantCollection, riderCollection } from "../firebase-config"
import { GOOGLE } from '../config'

export default {
    data() {
        return {
            statuss: ORDER_STATUS,
            payments: ORDER_PAYMENT,
            paymentStatus: PAYMENT_STATUS,
            order_id: this.$route.params.order_id,
            order: null,
            orderRef: null,
            orderDoc: null,
            restaurant: null,
            rider: null,
            riderRef: null,
            rider_marker: null,
            google: null,
            map: null,
            restaurant_address: null,
            message: "",
        }
    },
    created() {
        document.title = "Let's Bee | Order | " + this.order_id;

        this.$store.commit("showLoader");
        this.orderDoc = orderCollection.doc(this.order_id)
        this.orderRef = this.orderDoc.onSnapshot((order) => {
            if (!order.exists) {
                alert("Not Found");
                this.$router.replace({name: "Dashboard"});
                return false;
            }

            this.order = order.data();

            if (this.restaurant == null && this.order.restaurant_id) {
                restaurantCollection.doc(this.order.restaurant_id).get().then(
                    (restaurant) => {
                        if (!restaurant.exists) {
                            alert("Invalid Restaurant");
                            this.$router.replace({name: "Dashboard"});
                        }

                        this.restaurant = {id: restaurant.id, ...restaurant.data()};

                        if (this.isLoadMap) {
                            this.initializeMap();
                            this.$store.commit("hideLoader");
                        }
                    } 
                );
            }

            if (this.order.rider_id && this.rider == null) {
                this.riderRef = riderCollection.doc(this.order.rider_id).onSnapshot((rider) => {
                    this.rider = {id: rider.id, ...rider.data()}

                    if (this.rider_marker) {
                        if (this.rider_marker.getMap() == null) {
                            this.rider_marker.setMap(this.map);
                        }
                        this.rider_marker.setPosition({lat: this.rider.location.latitude, lng: this.rider.location.longitude});
                    }
                });
            }
        });
    },
    
    async mounted() {
        this.google =  await GoogleMapsApiLoader({
            apiKey: GOOGLE.map.key
        }).catch(err => {
            console.log(err);
            alert("Something went wrong on Google Map. Please try refreshing the page");
            this.$store.commit("hideLoader");
        });

        this.isLoadMap = true;
        if (this.restaurant != null) {
            this.initializeMap();
            this.$store.commit("hideLoader");
        }
    },
    
    methods: {
        validateDateNum: function(n) { 
            return (n < 10 ? '0' : '') + n; 
        },
        formatFBtimestamp: function(timestamp) {
            if (!timestamp) {
                return "";
            }
            
            var date = new Date(timestamp.toDate());

            var hours = date.getHours();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            
            return MONTH[date.getMonth()] + ' ' + this.validateDateNum(date.getDate()) + ", " + date.getFullYear() + " " +
                this.validateDateNum(hours) + ':' + this.validateDateNum(date.getMinutes()) + ' ' + ampm;
        },

        initializeMap: function() {
            this.map = new this.google.maps.Map(this.$refs.orderMap, {
                center: { lat: 15.1450545, lng: 120.5894371},
                zoom: 10,
                streetViewControl: false,
                mapTypeId: this.google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true
            });

            var userMarker = new this.google.maps.Marker({
                label: "You",
                title: "You",
                map: this.map,
            });
            var restaurantWindow = new this.google.maps.InfoWindow({
                content: this.restaurant.name, 
                position: {lat: this.restaurant.location.latitude, lng: this.restaurant.location.longitude}
            });
            restaurantWindow.open(this.map);

            this.rider_marker = new this.google.maps.Marker({
                title: "Let's Bee Driver",
                icon: 'http://localhost:8080/images/driver.png',
                map: null
            });
            
            var directionsRenderer = new this.google.maps.DirectionsRenderer({suppressMarkers: true});
            directionsRenderer.setMap(this.map);
            
            new this.google.maps.DirectionsService().route(
                {
                    origin: { lat: this.order.customer_location.latitude, lng: this.order.customer_location.longitude },
                    destination: { lat: this.restaurant.location.latitude, lng: this.restaurant.location.longitude },
                    travelMode: this.google.maps.TravelMode.DRIVING,
                },
                (response, status) => {
                    if (status === "OK") {
                        console.log(response);
                        directionsRenderer.setDirections(response);
                        var leg = response.routes[ 0 ].legs[ 0 ];
                        this.restaurant_address = leg.end_address;
                        userMarker.setPosition(leg.start_location);
                        if (this.rider) {
                            this.rider_marker.setMap(this.map);
                            this.rider_marker.setPosition({lat: this.rider.location.latitude, lng: this.rider.location.longitude});
                        }
                    } else {
                        alert("Directions request failed due to " + status);
                    }
                }
            );
        },
        sendMessage: function() {
            
            if (!this.message) {
                alert("Please fill up the message field before sending a message");
                return false;
            }
            this.orderDoc.update({
                chats: firebase.firestore.FieldValue.arrayUnion({
                    created_at: firebase.firestore.Timestamp.fromDate(new Date()),
                    message: this.message,
                    user_id: this.order.user_id
                })
            }).then((result) => {
                console.log(result);
                this.message = "";
            })
        }
    },
}
</script>