<template>
    <div>

    </div>
</template>

<script>
    import firebase from 'firebase'
    import { userCollection, orderCollection } from '../firebase-config'

    export default {
        created() {
            this.$session.start();
            
            userCollection.doc(this.$session.get("auid")).get().then(
                (auth) => {
                    if (auth.empty) {
                        alert("User not Found");
                        this.$router.replace({name: "Dashboard"});
                    }

                    this.auth = {id: auth.id, ...auth.data()};

                    orderCollection.add({
                        restaurant_id: "jollibee123",
                        user_id: this.auth.id,
                        menu_orders: {
                            name: "Chicken joy",
                            price: 75
                        },
                        status: 1,
                        ordered_time: firebase.firestore.Timestamp.fromDate(new Date()),
                        restaurant_pick_time: null,
                        rider_pick_time: null,
                        rider_pick_up_time: null,
                        delivered_time: null,
                        delivery_fee: 100,
                        rider_id: null,
                        reason: "",
                        chats: [],
                        customer_location: new firebase.firestore.GeoPoint(this.auth.location.latitude, this.auth.location.longitude),
                        payment: {
                            method: "paypal",
                            status: "pending",
                            details: null
                        }
                    }).then((result) => {
                        if (!result.id) {
                            alert("Something went wrong. (Placing order). Please try again");
                            return false;
                        }
                        alert("Successfully Created");
                        console.log(result);

                        this.$router.replace("/payment/" + result.id + "/paypal");
                    }).catch((err) => {
                        alert("Something went wrong. Failed to create order");
                        console.log(err);
                    });

                    
                }
            );

        },

    }
</script>