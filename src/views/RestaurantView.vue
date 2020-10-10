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

    const restaurantCollection = db.collection("restaurants");
    const customerOrderCollection = db.collection("customer_orders");

    export default {
        data() {
            return {
                restaurant_id: this.$route.params.restaurant_id,
                restaurant: {},
                auid: ""
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
            this.auid = this.$session.get("auid");
        },
        methods: {
            orderMenu: function(menu_name, menu_price) {
                
                customerOrderCollection
                    .where("user_id", "==", this.auid) // auid means user document id NOT uid
                    .where("status", "in", [1, 2, 4,]).get().then((result) => { // check if the user have pending order
                        if (!result.empty) {
                            alert("Invalid Request. You're order still on proccess"); // wait the order to be delivered to be able to order again
                        } else {
                            customerOrderCollection.add({
                                menu_orders: {
                                    name: menu_name,
                                    price: menu_price
                                },
                                reason: "",
                                restaurant_id: this.restaurant_id,
                                status: 1,
                                ordered_time: firebase.firestore.Timestamp.fromDate(new Date()),
                                restaurant_pick_time: null,
                                rider_pick_time: null,
                                rider_id: null,
                                delivered_time: null,
                                user_id: this.auid,
                                chats: null
                            });
                            alert("Successfully ordered");
                        }
                    })
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>