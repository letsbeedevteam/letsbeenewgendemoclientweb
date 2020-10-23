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
    import { orderCollection } from '../firebase-config'

    export default {
        data() {
            return {
                order_id: this.$route.params.order_id,
                processing: true
            }
        },
        created() {
            var del = orderCollection.doc(this.order_id).delete();
            console.log(del);
            del.then((result) => {
                console.log(result);
                this.processing = false;
            })
        }
    }
</script>