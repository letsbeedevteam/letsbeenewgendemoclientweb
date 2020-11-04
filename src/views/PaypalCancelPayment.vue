<template>
    <div class="text-center">
        <div v-if="processing">
            <h1>Processing...</h1>
            <img src="/images/loading.gif" alt="loading">
        </div>
        <div v-else>
            <h1>Payment has been canceled</h1>
            <small>You can now safely close this window/page</small>
        </div>
    </div>
</template>

<script>
    import { orderCollection, restaurantCollection } from '../firebase-config'
    import { NETWORK_URL } from '../config'

    export default {
        data() {
            return {
                order_id: this.$route.query.order_id,
                is_mobile: this.$route.query.mobile && this.$route.query.mobile == "true" ? true : false,
                processing: true
            }
        },
        created() {
            var orderRef = orderCollection.doc(this.order_id);
            
            if (this.is_mobile) {

                orderRef.delete().then(() => {
                    this.processing = false;
                    window.location = NETWORK_URL + "/payment/success";
                }).catch(this.catchFirebase);

            } else {

                orderRef.get().then((result) => {
                    if (!result.exists) {
                        alert("Order not found");
                        this.$router.replace("/dashboard");
                    }

                    let order = { id: result.id, ...result.data()};

                    orderRef.delete().then(() => {
                        
                        restaurantCollection.doc(order.restaurant_id).get().then((restaurant_result) => {
                            if (!restaurant_result.exists) {
                                alert("Restaurant not found. You're now redirecting to dashboard");
                                this.$router.replace("/dashboard");
                            }
    
                            let restaurant = { id: restaurant_result.id, ...restaurant_result.data() };
                            this.processing = false;

                            this.$router.push({name: "RestaurantView", params: { restaurant_id: restaurant.id }});
                        }).catch((err) => {
                            console.log(err);
                            this.processing = false;
                            alert("Something went wrong. Failed to load google firebase. \nbut you've successfull cancel the payment.");

                            this.$router.replace("/dashboard");
                        }); // get restaurant

                    }).catch(this.catchFirebase); // delete order

                }).catch(this.catchFirebase); // get order
            }
        },

        methods: {

            catchFirebase: function(err) {
                console.log(err);
                alert("Something went wrong. Failed to load google firebase");
                if (this.is_mobile) {
                    window.location = NETWORK_URL + "/payment/success";
                } else {
                    this.$router.replace("/dashboard");
                }
            },

        },
    }
</script>