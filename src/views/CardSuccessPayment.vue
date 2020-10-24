<template>
    <div class="text-center">
        <h1>Payment has been accepted</h1>
        <div v-if="is_mobile">
            <small class="d-block">You can now close this window/page</small>
            <a class="d-block" href="/payment/success">Go back to Dashboard</a>
        </div>
        <div v-else>
            <a v-bind:href="'http://localhost:8080/orders/' + order_id" class="btn btn-primary">View your Order</a>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                order_id: this.$route.query.order_id,
                is_mobile: this.$route.query.mobile && this.$route.query.mobile == "true" ? true : false
            }
        }
    }
</script>