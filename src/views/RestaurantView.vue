<template>
    <div class="container">
        <h1>{{ restaurant.name }}</h1>
        <p v-html="restaurant.description"></p>

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
                    <td>{{ menu.price }} </td>
                    <td><button type="button" class="btn btn-primary" @click="orderMenu(menu.name, menu.price)">Order</button></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import firebase from 'firebase';
    import { db } from "../firebase-config";

    const userCollection = db.collection("users");
    const restaurantCollection = db.collection("restaurants");
    const customerOrderCollection = db.collection("customer_orders");

    export default {
        data() {
            return {
                restaurant_id: this.$route.params.restaurant_id,
                restaurant: {},
                auth: null
            }
        },
        created() {
            restaurantCollection.doc(this.restaurant_id).get().then(
                (result) => {
                    if (result.empty) {
                        alert("Not Found");
                        this.$router.replace({name: "Dashboard"});
                    }
                    this.restaurant = {id: result.id, ...result.data()};
                }
            );
            this.$session.start();
            
            userCollection.doc(this.$session.get("auid")).get()
                .then((result) => {
                    if (result.empty) {
                        alert("No User Found");
                        this.$router.replace({name: "Dashboard"});
                    }

                    this.auth = {id: result.id, ...result.data()};
                });
        },
        methods: {
            orderMenu: function(menu_name, menu_price) {
                
                if (this.auth.location == null) {
                    alert("Please select your address first before ordering. (check the dropdown on the top right of the window)");
                    return;
                }
                
                customerOrderCollection.where("user_id", "==", this.auth.id).where("status", "in", [1, 2, 4,]).get().then(
                    (result) => {
                        if (!result.empty) {
                            alert("Invalid Request. You're order still on proccess"); 
                            return false;
                        } 

                        var matrix = new window.google.maps.DistanceMatrixService();
                        var _this = this;
                        matrix.getDistanceMatrix({
                                origins: [new window.google.maps.LatLng(this.auth.location.latitude, this.auth.location.longitude)],
                                destinations: [new window.google.maps.LatLng(this.restaurant.location.latitude , this.restaurant.location.longitude)],
                                travelMode: window.google.maps.TravelMode.DRIVING,
                            }, function(response, status) {
                                
                                if (status != "OK") {
                                    alert("Invalid Request, Google Map can't get the distance, please try again");
                                    return false;
                                }

                                var deliveryFee = Math.ceil(response.rows[0].elements[0].distance.value / 100) * 5,
                                totalPrice = deliveryFee + menu_price;
                                if (confirm("Order Details\nName: " + menu_name + "\nPrice: " + menu_price + "\nDelivery Fee: P " + deliveryFee + "\nTotal Price: P " + totalPrice)) {
                                    customerOrderCollection.add({
                                        menu_orders: {
                                            name: menu_name,
                                            price: menu_price
                                        },
                                        reason: "",
                                        restaurant_id: _this.restaurant_id,
                                        status: 1,
                                        ordered_time: firebase.firestore.Timestamp.fromDate(new Date()),
                                        restaurant_pick_time: null,
                                        rider_pick_time: null,
                                        rider_id: null,
                                        delivered_time: null,
                                        delivery_fee: deliveryFee,
                                        user_id: _this.auth.id,
                                        chats: null
                                    });
    
                                    alert("Successfully ordered");
                                }
                            }
                        );
                    }
                );
                
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>