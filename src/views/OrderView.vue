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
                            <td>Total</td>
                            <td><span>&#8369;</span> {{ order.menu_orders.price }}</td>
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
                                    <div><small>{{ rider.name }}</small></div>
                                    <div>{{ chat.message }}</div>
                                    <div><small>{{ formatFBtimestamp(chat.created_at) }}</small></div>
                                </div>
                                <div v-else class="text-right">
                                    <div><small>{{ user.name }} </small></div>
                                    <div>{{ chat.message }}</div>
                                    <div><small>{{ formatFBtimestamp(chat.created_at) }}</small></div>
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
                <!-- <img src="/images/google-map-sample.PNG" alt="" class="img-fluid"> -->
                <div id="map" ref="map"></div>
            </div>
        </div>
    </div>
</template>

<script>
    
    import { db } from "../firebase-config";
    import { ORDERSTATUS } from '../orderStatus';
    import firebase from 'firebase';

    var validateDateNum = function(n) { return (n < 10 ? '0' : '') + n; }

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
                user: "",
                map:null
            }
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
                        }
                    );

                    if (this.order.rider_id) {
                        userCollection.doc(this.order.rider_id).get().then(
                            (result) => {
                                this.rider = {id: result.id, ...result.data()}
                            }
                        );
                    }

                    userCollection.doc(this.order.user_id).get().then(
                        (result) => {
                            this.user = {id: result.id, ...result.data()}
                        }
                    )
                }
            );
        },
        mounted() {
            this.map = new window.google.maps.Map(this.$refs["map"], {
                center: { lat: -25.344, lng: 131.036},
                zoom: 4
            })
        }
        
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