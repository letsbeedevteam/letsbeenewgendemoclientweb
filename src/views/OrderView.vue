<template>
    <div class="container">
        <h1 class="text-center">Order</h1>
        <div class="text-center"><small  v-if="order">ID: {{ order_id }}</small></div>

        <div class="row" >
            <div class="col-8" v-if="order">
                <!-- <h3>Order Information</h3> -->

                <h3>Ordered Menu</h3>
                <table class="table">
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

                <h3>Informations</h3>
                <table class="table">
                    <tbody>
                        <tr>
                            <td>Ordered Time</td>
                            <td>{{ formatFBtimestamp(order.ordered_time) }}</td>
                        </tr>
                        <tr>
                            <td>Order status</td>
                            <td>{{ orderStatus[order.status] }}</td>
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
                            <td>{{ formatFBtimestamp(order.restaurant_pick_time) }}</td>
                        </tr>
                        <tr v-if="order.rider_pick_up_time">
                            <td>Rider Response Time</td>
                            <td>{{ formatFBtimestamp(order.rider_pick_up_time) }}</td>
                        </tr>
                        <tr v-if="order.delivered_time">
                            <td>Delivered Tme</td>
                            <td>{{ formatFBtimestamp(order.delivered_time) }}</td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="order.rider_id && rider">
                    <h3>Rider Info</h3>
                    <table class="table">
                        <tbody>
                            <tr>
                                <td>name</td>
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

                <div class="card bg-light mb-3 w-100" v-if="order.chats > 0 && order.rider_id && Object.keys(rider).length > 0">
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
                <div id="orderMap"></div>

                <!-- <div class="mt-3">
                    <button type="button" class="btn btn-primary" @click="updateDriverMarker"> Update driver marker</button>
                </div> -->
            </div>
        </div>
    </div>
</template>

<script>
    import { ORDERSTATUS } from '../orderStatus'
    import { orderCollection, restaurantCollection, userCollection} from "../firebase-config"
    import { GOOGLE } from '../config'
    
    export default {
        data() {
            return {
                orderStatus: ORDERSTATUS,
                order_id: this.$route.params.order_id,
                order: null,
                orderRef: null,
                orderDoc: null,
                restaurant: null,
                rider: null,
                riderRef: null,
                rider_marker: null,
                mapLoad: false
            }
        },
        created() {
            this.orderDoc = orderCollection.doc(this.order_id)
            this.orderRef = this.orderDoc.onSnapshot((order) => {
                if (!order.exists) {
                    alert("Not Found");
                    this.$router.replace({name: "Dashboard"});
                    return false;
                }
                this.order = order.data();
                
                if (this.restaurant == null) {
                    restaurantCollection.doc(this.order.restaurant_id).get().then(
                        (restaurant) => {
                            if (!restaurant.exists) {
                                alert("Invalid Restaurant");
                                this.$router.replace({name: "Dashboard"});
                            }
    
                            this.restaurant = {id: restaurant.id, ...restaurant.data()};
    
                            if (this.mapLoad) {
                                this.initMap();
                            }
                        } 
                    );
                }

                if (this.order.rider_id && this.rider == null) {
                    this.riderRef = userCollection.doc(this.order.rider_id).onSnapshot(
                        (rider) => {
                            this.rider = {id: rider.id, ...rider.data()}

                            if (this.rider_marker) {
                                this.rider_marker.setPosition({lat: this.rider.location.latitude, lng: this.rider.location.longitude});
                            }
                        }
                    );
                }
            });
        },
        mounted() {
            if (!document.getElementById("googleMapScript")) {
                var _this = this;
                let googleMapScript = document.createElement('script');
                googleMapScript.id = "googleMapScript";
                googleMapScript.src = 'https://maps.googleapis.com/maps/api/js?key=' + GOOGLE.map.key;
                googleMapScript.addEventListener("load", function() {
                    _this.mapLoad = true;
                    if (_this.order != null) {
                        console.log("1.5");
                        _this.initMap();
                    }
                });
                document.head.appendChild(googleMapScript);
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

                var t = new Date(1970, 0, 1);
                t.setSeconds(timestamp.seconds);

                return this.validateDateNum(t.getDate()) + "/" + this.validateDateNum(t.getMonth() + 1) + "/" + t.getFullYear() + " " + 
                    this.validateDateNum(t.getHours()) + ":" + this.validateDateNum(t.getMinutes()) + ":" + this.validateDateNum(t.getSeconds());
            },
            initMap: function() {
                var map = new window.google.maps.Map(document.getElementById("orderMap"), {
                    center: { lat: 15.1450545, lng: 120.5894371},
                    zoom: 10,
                    streetViewControl: false,
                    mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true
                });

                var userMarker = new window.google.maps.Marker({
                    label: "You",
                    title: "You",
                    map: map,
                });
                var infoWindow = new window.google.maps.InfoWindow({
                    content: this.restaurant.name, 
                    position: {lat: this.restaurant.location.latitude, lng: this.restaurant.location.longitude}
                });
                infoWindow.open();

                this.rider_marker = new window.google.maps.Marker({
                    title: "Let's Bee Driver",
                    icon: 'http://localhost:8080/images/driver.png',
                    map: map,
                });
                
                var directionsService = new window.google.maps.DirectionsService();
                var directionsRenderer = new window.google.maps.DirectionsRenderer({suppressMarkers: true});

                directionsRenderer.setMap(map);
                directionsService.route(
                    {
                        origin: { lat: this.order.customer_location.latitude, lng: this.order.customer_location.longitude },
                        destination: { lat: this.restaurant.location.latitude, lng: this.restaurant.location.longitude },
                        travelMode: window.google.maps.TravelMode.DRIVING,
                    },
                    (response, status) => {
                        if (status === "OK") {
                            directionsRenderer.setDirections(response);
                            var leg = response.routes[ 0 ].legs[ 0 ];
                            userMarker.setPosition(leg.start_location);
                            if (this.rider) {
                                this.rider_marker.setPosition({lat: this.rider.location.latitude, lng: this.rider.location.longitude});
                            }
                        } else {
                            alert("Directions request failed due to " + status);
                        }
                    }
                );
                
            },
        },
    }
</script>