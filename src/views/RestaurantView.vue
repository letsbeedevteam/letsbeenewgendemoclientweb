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
                                <td><button type="button" v-bind:class="[selectClass, btnDisabled ? 'disabled' : '']" @click="selectOrder(menu.name, menu.price)">Select</button></td>
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
                    <button type="button" class="btn btn-success w-100 p-2 mb-3" v-bind:class="[btnDisabled ? 'disabled' : '']" @click="orderByDelivery">
                        <i class="fas fa-truck"></i>
                        Cash on Delivery
                    </button>
                    <button type="button" class="btn btn-primary w-100 p-2 mb-3" v-bind:class="[btnDisabled ? 'disabled' : '']" @click="orderByGCash">
                        <i class="fab fa-gofore"></i>
                        GCash
                    </button>
                    <button type="button" class="btn btn-info w-100 p-2 mb-3" v-bind:class="[btnDisabled ? 'disabled' : '']" @click="orderByCard">
                        <i class="far fa-credit-card"></i>
                        Card
                    </button>
                    <button type="button" class="btn btn-paypal w-100 mb-3" v-bind:class="[btnDisabled ? 'disabled' : '']" @click="orderByPaypal"> 
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAxcHgiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAxMDEgMzIiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHhtbG5zPSJodHRwOiYjeDJGOyYjeDJGO3d3dy53My5vcmcmI3gyRjsyMDAwJiN4MkY7c3ZnIj48cGF0aCBmaWxsPSIjMDAzMDg3IiBkPSJNIDEyLjIzNyAyLjggTCA0LjQzNyAyLjggQyAzLjkzNyAyLjggMy40MzcgMy4yIDMuMzM3IDMuNyBMIDAuMjM3IDIzLjcgQyAwLjEzNyAyNC4xIDAuNDM3IDI0LjQgMC44MzcgMjQuNCBMIDQuNTM3IDI0LjQgQyA1LjAzNyAyNC40IDUuNTM3IDI0IDUuNjM3IDIzLjUgTCA2LjQzNyAxOC4xIEMgNi41MzcgMTcuNiA2LjkzNyAxNy4yIDcuNTM3IDE3LjIgTCAxMC4wMzcgMTcuMiBDIDE1LjEzNyAxNy4yIDE4LjEzNyAxNC43IDE4LjkzNyA5LjggQyAxOS4yMzcgNy43IDE4LjkzNyA2IDE3LjkzNyA0LjggQyAxNi44MzcgMy41IDE0LjgzNyAyLjggMTIuMjM3IDIuOCBaIE0gMTMuMTM3IDEwLjEgQyAxMi43MzcgMTIuOSAxMC41MzcgMTIuOSA4LjUzNyAxMi45IEwgNy4zMzcgMTIuOSBMIDguMTM3IDcuNyBDIDguMTM3IDcuNCA4LjQzNyA3LjIgOC43MzcgNy4yIEwgOS4yMzcgNy4yIEMgMTAuNjM3IDcuMiAxMS45MzcgNy4yIDEyLjYzNyA4IEMgMTMuMTM3IDguNCAxMy4zMzcgOS4xIDEzLjEzNyAxMC4xIFoiPjwvcGF0aD48cGF0aCBmaWxsPSIjMDAzMDg3IiBkPSJNIDM1LjQzNyAxMCBMIDMxLjczNyAxMCBDIDMxLjQzNyAxMCAzMS4xMzcgMTAuMiAzMS4xMzcgMTAuNSBMIDMwLjkzNyAxMS41IEwgMzAuNjM3IDExLjEgQyAyOS44MzcgOS45IDI4LjAzNyA5LjUgMjYuMjM3IDkuNSBDIDIyLjEzNyA5LjUgMTguNjM3IDEyLjYgMTcuOTM3IDE3IEMgMTcuNTM3IDE5LjIgMTguMDM3IDIxLjMgMTkuMzM3IDIyLjcgQyAyMC40MzcgMjQgMjIuMTM3IDI0LjYgMjQuMDM3IDI0LjYgQyAyNy4zMzcgMjQuNiAyOS4yMzcgMjIuNSAyOS4yMzcgMjIuNSBMIDI5LjAzNyAyMy41IEMgMjguOTM3IDIzLjkgMjkuMjM3IDI0LjMgMjkuNjM3IDI0LjMgTCAzMy4wMzcgMjQuMyBDIDMzLjUzNyAyNC4zIDM0LjAzNyAyMy45IDM0LjEzNyAyMy40IEwgMzYuMTM3IDEwLjYgQyAzNi4yMzcgMTAuNCAzNS44MzcgMTAgMzUuNDM3IDEwIFogTSAzMC4zMzcgMTcuMiBDIDI5LjkzNyAxOS4zIDI4LjMzNyAyMC44IDI2LjEzNyAyMC44IEMgMjUuMDM3IDIwLjggMjQuMjM3IDIwLjUgMjMuNjM3IDE5LjggQyAyMy4wMzcgMTkuMSAyMi44MzcgMTguMiAyMy4wMzcgMTcuMiBDIDIzLjMzNyAxNS4xIDI1LjEzNyAxMy42IDI3LjIzNyAxMy42IEMgMjguMzM3IDEzLjYgMjkuMTM3IDE0IDI5LjczNyAxNC42IEMgMzAuMjM3IDE1LjMgMzAuNDM3IDE2LjIgMzAuMzM3IDE3LjIgWiI+PC9wYXRoPjxwYXRoIGZpbGw9IiMwMDMwODciIGQ9Ik0gNTUuMzM3IDEwIEwgNTEuNjM3IDEwIEMgNTEuMjM3IDEwIDUwLjkzNyAxMC4yIDUwLjczNyAxMC41IEwgNDUuNTM3IDE4LjEgTCA0My4zMzcgMTAuOCBDIDQzLjIzNyAxMC4zIDQyLjczNyAxMCA0Mi4zMzcgMTAgTCAzOC42MzcgMTAgQyAzOC4yMzcgMTAgMzcuODM3IDEwLjQgMzguMDM3IDEwLjkgTCA0Mi4xMzcgMjMgTCAzOC4yMzcgMjguNCBDIDM3LjkzNyAyOC44IDM4LjIzNyAyOS40IDM4LjczNyAyOS40IEwgNDIuNDM3IDI5LjQgQyA0Mi44MzcgMjkuNCA0My4xMzcgMjkuMiA0My4zMzcgMjguOSBMIDU1LjgzNyAxMC45IEMgNTYuMTM3IDEwLjYgNTUuODM3IDEwIDU1LjMzNyAxMCBaIj48L3BhdGg+PHBhdGggZmlsbD0iIzAwOWNkZSIgZD0iTSA2Ny43MzcgMi44IEwgNTkuOTM3IDIuOCBDIDU5LjQzNyAyLjggNTguOTM3IDMuMiA1OC44MzcgMy43IEwgNTUuNzM3IDIzLjYgQyA1NS42MzcgMjQgNTUuOTM3IDI0LjMgNTYuMzM3IDI0LjMgTCA2MC4zMzcgMjQuMyBDIDYwLjczNyAyNC4zIDYxLjAzNyAyNCA2MS4wMzcgMjMuNyBMIDYxLjkzNyAxOCBDIDYyLjAzNyAxNy41IDYyLjQzNyAxNy4xIDYzLjAzNyAxNy4xIEwgNjUuNTM3IDE3LjEgQyA3MC42MzcgMTcuMSA3My42MzcgMTQuNiA3NC40MzcgOS43IEMgNzQuNzM3IDcuNiA3NC40MzcgNS45IDczLjQzNyA0LjcgQyA3Mi4yMzcgMy41IDcwLjMzNyAyLjggNjcuNzM3IDIuOCBaIE0gNjguNjM3IDEwLjEgQyA2OC4yMzcgMTIuOSA2Ni4wMzcgMTIuOSA2NC4wMzcgMTIuOSBMIDYyLjgzNyAxMi45IEwgNjMuNjM3IDcuNyBDIDYzLjYzNyA3LjQgNjMuOTM3IDcuMiA2NC4yMzcgNy4yIEwgNjQuNzM3IDcuMiBDIDY2LjEzNyA3LjIgNjcuNDM3IDcuMiA2OC4xMzcgOCBDIDY4LjYzNyA4LjQgNjguNzM3IDkuMSA2OC42MzcgMTAuMSBaIj48L3BhdGg+PHBhdGggZmlsbD0iIzAwOWNkZSIgZD0iTSA5MC45MzcgMTAgTCA4Ny4yMzcgMTAgQyA4Ni45MzcgMTAgODYuNjM3IDEwLjIgODYuNjM3IDEwLjUgTCA4Ni40MzcgMTEuNSBMIDg2LjEzNyAxMS4xIEMgODUuMzM3IDkuOSA4My41MzcgOS41IDgxLjczNyA5LjUgQyA3Ny42MzcgOS41IDc0LjEzNyAxMi42IDczLjQzNyAxNyBDIDczLjAzNyAxOS4yIDczLjUzNyAyMS4zIDc0LjgzNyAyMi43IEMgNzUuOTM3IDI0IDc3LjYzNyAyNC42IDc5LjUzNyAyNC42IEMgODIuODM3IDI0LjYgODQuNzM3IDIyLjUgODQuNzM3IDIyLjUgTCA4NC41MzcgMjMuNSBDIDg0LjQzNyAyMy45IDg0LjczNyAyNC4zIDg1LjEzNyAyNC4zIEwgODguNTM3IDI0LjMgQyA4OS4wMzcgMjQuMyA4OS41MzcgMjMuOSA4OS42MzcgMjMuNCBMIDkxLjYzNyAxMC42IEMgOTEuNjM3IDEwLjQgOTEuMzM3IDEwIDkwLjkzNyAxMCBaIE0gODUuNzM3IDE3LjIgQyA4NS4zMzcgMTkuMyA4My43MzcgMjAuOCA4MS41MzcgMjAuOCBDIDgwLjQzNyAyMC44IDc5LjYzNyAyMC41IDc5LjAzNyAxOS44IEMgNzguNDM3IDE5LjEgNzguMjM3IDE4LjIgNzguNDM3IDE3LjIgQyA3OC43MzcgMTUuMSA4MC41MzcgMTMuNiA4Mi42MzcgMTMuNiBDIDgzLjczNyAxMy42IDg0LjUzNyAxNCA4NS4xMzcgMTQuNiBDIDg1LjczNyAxNS4zIDg1LjkzNyAxNi4yIDg1LjczNyAxNy4yIFoiPjwvcGF0aD48cGF0aCBmaWxsPSIjMDA5Y2RlIiBkPSJNIDk1LjMzNyAzLjMgTCA5Mi4xMzcgMjMuNiBDIDkyLjAzNyAyNCA5Mi4zMzcgMjQuMyA5Mi43MzcgMjQuMyBMIDk1LjkzNyAyNC4zIEMgOTYuNDM3IDI0LjMgOTYuOTM3IDIzLjkgOTcuMDM3IDIzLjQgTCAxMDAuMjM3IDMuNSBDIDEwMC4zMzcgMy4xIDEwMC4wMzcgMi44IDk5LjYzNyAyLjggTCA5Ni4wMzcgMi44IEMgOTUuNjM3IDIuOCA5NS40MzcgMyA5NS4zMzcgMy4zIFoiPjwvcGF0aD48L3N2Zz4=" data-v-fd53f700="" alt="" aria-label="PayPal" class="paypal-logo">
                    </button>
                </div>
            </div>
        </div>


    </div>
</template>

<script>
    import firebase from 'firebase'
    import axios from 'axios'
    import GoogleMapsApiLoader from 'google-maps-api-loader'
    import { FIREBASE, GOOGLE } from '../config'
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
                selectClass: "btn btn-primary",
                btnDisabled: true
            }
        },

        created() {
            this.$store.commit("showLoader");
            this.$session.start();

            document.title = "Let's Bee | Restaurant | ";

            restaurantCollection.doc(this.restaurant_id).get().then(
                (result) => {
                    if (result.empty) {
                        alert("Restaurant Not Found");
                        this.$router.replace({name: "Dashboard"});
                    }
                    this.restaurant = {id: result.id, ...result.data()};

                    document.title = document.title + " " + this.restaurant.name;
                }
            );
            
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
            this.google =  await GoogleMapsApiLoader({
                apiKey: GOOGLE.map.key
            }).catch(this.catchError);

            this.btnDisabled = false;
            this.$store.commit("hideLoader");
        },

        methods: {
           
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
                if (this.order.total_price <= 0) { 
                    alert("Please select Menu first");
                    return false;
                }

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

                        this.createOrder("cod", "pending", null).then((create_result) => {
                            
                            if (!create_result.id) {
                                alert("Something went wrong. Please try again (Placing order)");
                                return false;
                            }

                            alert("Successfully ordered\n\nStatus: pending");

                            this.sendNotification();
                            this.$router.push("/orders/" + create_result.id);

                        }, (this.catchError)).catch(this.catchError);
                        
                    }, 
                    (this.catchError)
                ).catch(this.catchError);
            },

            orderByGCash: function() {
                if (this.order.total_price <= 0) { 
                    alert("Please select Menu first");
                    return false;
                }

                if (this.auth.location.latitude == 0 && this.auth.location.longitude == 0) {
                    alert("Please select your address first before ordering. (check the dropdown on the top right of the window)");
                    return false;
                }

                orderCollection.where("user_id", "==", this.auth.id).where("status", "in", [1, 2, 4,]).get().then((result) => {
                    if (!result.empty) {
                        alert("Invalid Request. You're order still on proccess"); 
                        return false;
                    } 
                    
                    this.createOrder("gcash", "pending", null).then((create_result) => {
                        if (!create_result.id) {
                            alert("Something went wrong. Please try again (Placing order)");
                            return false;
                        }

                        this.$router.push("/payment/" + create_result.id + "/gcash");
                    }, (this.catchError)).catch(this.catchError);

                });
            },

            orderByPaypal: function() {
                if (this.order.total_price <= 0) { 
                    alert("Please select Menu first");
                    return false;
                }

                if (this.auth.location.latitude == 0 && this.auth.location.longitude == 0) {
                    alert("Please select your address first before ordering. (check the dropdown on the top right of the window)");
                    return false;
                }

                orderCollection.where("user_id", "==", this.auth.id).where("status", "in", [1, 2, 4,]).get().then((result) => {
                    if (!result.empty) {
                        alert("Invalid Request. You're order still on proccess"); 
                        return false;
                    } 
                    
                    this.createOrder("paypal", "pending", null).then((create_result) => {
                        if (!create_result.id) {
                            alert("Something went wrong. Please try again (Placing order)");
                            return false;
                        }

                        this.$router.push("/payment/" + create_result.id + "/paypal");
                    }, (this.catchError)).catch(this.catchError);

                });
            },

            orderByCard: function() {
                if (this.order.total_price <= 0) { 
                    alert("Please select Menu first");
                    return false;
                }

                if (this.auth.location.latitude == 0 && this.auth.location.longitude == 0) {
                    alert("Please select your address first before ordering. (check the dropdown on the top right of the window)");
                    return false;
                }

                orderCollection.where("user_id", "==", this.auth.id).where("status", "in", [1, 2, 4,]).get().then((result) => {
                    if (!result.empty) {
                        alert("Invalid Request. You're order still on proccess"); 
                        return false;
                    } 
                    
                    this.createOrder("card", "pending", null).then((create_result) => {
                        if (!create_result.id) {
                            alert("Something went wrong. Please try again (Placing order)");
                            return false;
                        }

                        this.$router.push("/payment/" + create_result.id + "/card");
                    }, (this.catchError)).catch(this.catchError);

                });
            },
            
            createOrder: async function(payment_method, payment_status, payment_details) {
                return orderCollection.add({
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
                        details: payment_details
                    }
                });
                /* .then((result) => {
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
                }); */
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

            catchError: function(err) {
                console.log(err);
                alert("Something went wrong");
                if (err.response) {
                    console.log(err.response.data)
                }
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