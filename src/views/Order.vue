<template>
    <div class="container">
        <h1>Orders</h1>

        <table class="table table-stripped">
            <thead>
                <tr>
                    <th>Order</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Ordered Time</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody v-if="orders.length > 0">
                <tr v-for="order in orders" :key="order.id">
                    <td>{{ order.menu_orders.name }}</td>
                    <td><span>&#8369;</span> {{ order.menu_orders.price }}</td>
                    <td>{{ orderStatus[order.status] }}</td>
                    <td>{{ formatFBtimestamp(order.ordered_time) }}</td>
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
import { ORDER_STATUS, MONTH } from '../constant';

export default {
    data() {
        return {
            orders: [],
            orderStatus: ORDER_STATUS,
            orderRef: null,
        }
    },
    created() {
        document.title = "Let's Bee | Order Lists";
        
        this.$store.commit("showLoader");
        this.$session.start();
        let auid = this.$session.get("auid");

        this.orderRef = orderCollection.where("user_id", "==" , auid).orderBy("ordered_time", "desc").onSnapshot(
            (result) => {
                this.orders = result.docs.map(doc => {
                    return { id: doc.id, ...doc.data() }
                });
                this.$store.commit("hideLoader");
            }
        );
    },

    methods: {
        validateDateNum: function(n) { 
            return (n < 10 ? '0' : '') + n; 
        },

        formatFBtimestamp: function(timestamp) {
            if (!timestamp) {
                return "";
            }
            
            var date = new Date(timestamp.toDate());

            var hours = date.getHours();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            
            return MONTH[date.getMonth()] + ' ' + this.validateDateNum(date.getDate()) + ", " + date.getFullYear() + " " +
                this.validateDateNum(hours) + ':' + this.validateDateNum(date.getMinutes()) + ' ' + ampm;
        },
    },

    beforeDestroy() {
        this.orders = [];
        this.orderStatus = [];
        this.orderRef();
    }
}
</script>