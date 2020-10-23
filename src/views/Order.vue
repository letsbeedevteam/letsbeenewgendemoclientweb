<template>
    <div class="container">
        <h1>Orders</h1>

        <table class="table table-stripped">
            <thead>
                <tr>
                    <th>Order</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody v-if="orders.length > 0">
                <tr v-for="order in orders" :key="order.id">
                    <td>{{ order.menu_orders.name }}</td>
                    <td>{{ order.menu_orders.price }}</td>
                    <td>{{ orderStatus[order.status] }}</td>
                    <td>
                        <router-link v-bind:to="'/orders/' + order.id" class="btn btn-primary">View</router-link>
                    </td>
                </tr>
            </tbody>
            <tbody v-else>
                <tr>
                    <td colspan="4" class="text-center"> No orders found</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import { orderCollection } from "../firebase-config";
    import { ORDER_STATUS } from '../constant';

    export default {
        data() {
            return {
                orders: [],
                orderStatus: ORDER_STATUS,
                orderRef: null,
            }
        },
        created() {
            this.$store.commit("showLoader");
            this.$session.start();
            let auid = this.$session.get("auid");

            this.orderRef = orderCollection.where("user_id", "==" , auid).onSnapshot(
                (result) => {
                    this.orders = result.docs.map(doc => {
                        return { id: doc.id, ...doc.data() }
                    });
                    this.$store.commit("hideLoader");
                }
            );
        },
        beforeDestroy() {
            this.orders = [];
            this.orderStatus = [];
            this.orderRef();
        }
    }

</script>