<template>
    <div class="container">
        <h1>Order</h1>
        <small>ID: {{ order_id }}</small>

        <div class="row">
            <div class="col-8">
                <h3>Order Information</h3>
                <table class="table table-stripped">
                    <tbody>
                        <tr>
                            <td>Restaurant</td>
                            <td>{{ restaurant.name }}</td>
                        </tr>
                        <tr>
                            <td>Status</td>
                            <td>{{ orderStatus[order.status] }}</td>
                        </tr>
                        <tr>
                            <td>Ordered Time</td>
                            <td>{{ formatFBtimestamp(order.ordered_time) }}</td>
                        </tr>
                    </tbody>
                </table>

                <h3>Orders</h3>
                <table class="table" v-if="order.menu_orders">
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

                <h3>Rider Info</h3>
                <table  class="table">
                    <tbody v-if="order.rider_id && Object.keys(rider).length > 0">
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

                <div class="card bg-light mb-3 w-100">
                    <div class="card-header">Chats</div>
                    <div class="card-body chat-box">
                        <div class="chat-messages" v-if="order.chats && order.rider_id && Object.keys(rider).length > 0" >
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
                <div id="map" ref="map"></div>

                <div class="mt-3">
                    <button type="button" class="btn btn-primary" @click="updateDriverMarker"> Update driver marker</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    
    import { db } from "../firebase-config";
    import { ORDERSTATUS } from '../orderStatus';
    import firebase from 'firebase';

    var validateDateNum = function(n) { return (n < 10 ? '0' : '') + n; }
    var mapLoaded = false;

    const userCollection = db.collection("users");
    const restaurantCollection = db.collection("restaurants");
    const customerOrderCollection = db.collection("customer_orders");


    export default {
        data() {
            return {
                order_id: this.$route.params.order_id,
                order: {},
                orderDoc: {},
                restaurant: {},
                orderStatus: ORDERSTATUS,
                rider: {},
                message: "",
                rider_marker: null
            }
        },
        created() {
            this.orderDoc = customerOrderCollection.doc(this.order_id)
            this.orderDoc.onSnapshot(
                result => {
                    if (!result.exists) {
                        alert("Not Found");
                        this.$router.replace({name: "Dashboard"});
                    }

                    this.order = result.data();

                    restaurantCollection.doc(this.order.restaurant_id).get().then(
                        (result) => {
                            if (!result.exists) {
                                alert("Invalid Restaurant");
                                this.$router.replace({name: "Dashboard"});
                            }

                            this.restaurant = {id: result.id, ...result.data()};

                            userCollection.doc(this.order.user_id).get().then(
                                (result) => {
                                    // this.rider = {id: result.id, ...result.data()}
                                    var user = result.data();
                                    if (!mapLoaded) {
                                        this.initMap(
                                            { lat: user.location.latitude, lng: user.location.longitude },
                                            { lat: this.restaurant.location.latitude, lng: this.restaurant.location.longitude }
                                        );
                                        mapLoaded = true;
                                    }
                                }
                            );
                        }
                    );

                    if (this.order.rider_id) {
                        userCollection.doc(this.order.rider_id).get().then(
                            (result) => {
                                this.rider = {id: result.id, ...result.data()}
                            }
                        );
                    }
                }
            );
        },
        methods: {
            formatFBtimestamp: function(timestamp) {
                if (!timestamp) {
                    return "";
                }

                var t = new Date(1970, 0, 1);
                t.setSeconds(timestamp.seconds);

                return validateDateNum(t.getDate()) + "/" + validateDateNum(t.getMonth() + 1) + "/" + t.getFullYear() + " " + 
                    validateDateNum(t.getHours()) + ":" + validateDateNum(t.getMinutes()) + ":" + validateDateNum(t.getSeconds());
            },
            sendMessage: function() {
                if (!this.message) {
                    return;
                }

                this.orderDoc.update({
                    chats: firebase.firestore.FieldValue.arrayUnion({
                        created_at: firebase.firestore.Timestamp.fromDate(new Date()),
                        message: this.message,
                        user_id: this.order.user_id
                    })
                });

                this.message = "";
            },
            initMap: function(origin, destination) {
                var directionsService = new window.google.maps.DirectionsService();
                var directionsRenderer = new window.google.maps.DirectionsRenderer({suppressMarkers: true});
                var map = new window.google.maps.Map(this.$refs["map"], {
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
                this.rider_marker = new window.google.maps.Marker({
                    title: "Let's Bee Driver",
                    icon: 'http://localhost:8080/images/driver.png',
                    map: map,
                });

                directionsRenderer.setMap(map);
                directionsService.route(
                    {
                        origin: origin,
                        destination: destination,
                        travelMode: window.google.maps.TravelMode.DRIVING,
                    },
                    (response, status) => {
                        if (status === "OK") {
                            directionsRenderer.setDirections(response);
                            var leg = response.routes[ 0 ].legs[ 0 ];
                            userMarker.setPosition(leg.start_location);
                            this.rider_marker.setPosition(leg.end_location);

                        } else {
                            window.alert("Directions request failed due to " + status);
                        }
                    }
                );
            },
            updateDriverMarker: function() { // sample moving rider
                this.rider_marker.setPosition(new window.google.maps.LatLng( 15.163311792454815, 120.55535166729865 ));
            }
        },
        
    }


</script>

<style lang="scss" scoped>
    .chat-box {
        position: relative;
        height: 600px;
    }
    .chat-box .chat-messages {
        height: 550px;
    }
    .chat-box .chat-message {
        background-color: rgba(0,0,0,.03);
        margin-bottom: 0.5em;
        padding: 0.5em;
    }
    .chat-box .chat-message .chat-user-name {
        font-size: 0.75em;
    }
    .chat-box .chat-message .chat-user-date {
        font-size: 0.5em;
    }
    .chat-box .chat-input {
        height: 50px;
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
        background-color: #ffffff;
        padding: 0.35em;
    }
    #map {
        height: 600px;
        background-color: grey;
    }
</style>