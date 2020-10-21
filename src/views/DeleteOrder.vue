<template>
    <div>

    </div>
</template>

<script>
    import { orderCollection } from '../firebase-config'

    export default {
        data() {
            return {
                order_id: this.$route.params.order_id,
            }
        },
        created() {
            var del = orderCollection.doc(this.order_id).delete();
            console.log(del);
            del.then((result) => {
                console.log(result);
            })
        }
    }
</script>