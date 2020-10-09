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
            <tbody>
                <tr v-for="order in orders" :key="order.id">
                    <td>{{ order.menu_orders.name }}</td>
                    <td>{{ order.menu_orders.price }}</td>
                    <td>{{ orderStatus[order.status] }}</td>
                    <td>
                        <router-link v-bind:to="'/orders/' + order.id" class="btn btn-primary">View</router-link>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import { db } from "../firebase-config";
    import { ORDERSTATUS } from '../orderStatus';

    const orderCollection = db.collection("customer_orders");

    export default {
        data() {
            return {
                orders: [],
                orderStatus: ORDERSTATUS,
            }
        },
        created() {
            this.$session.start();
            let auid = this.$session.get("auid");
            console.log(auid); 

            orderCollection.where("user_id", "==" , auid).onSnapshot(
                (result) => {
                    this.orders = result.docs.map(doc => {
                        return { id: doc.id, ...doc.data() }
                    });
                }
            )
        }
    }

</script>

<style lang="scss" scoped>

</style>