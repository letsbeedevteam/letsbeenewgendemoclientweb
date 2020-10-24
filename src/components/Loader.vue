<template>
    <div id="loader" :class="isLoader">
        <div class="lcon">
            <img src="/images/loading.gif" alt="loading">
        </div>
    </div>
</template>

<script>
    import { NETWORK_URL } from "../config"

    export default {
        
        data() {
            return {
                url: NETWORK_URL
            };
        },

        computed: {
            isLoader: function() {
                return {show: this.$store.state.loader}
            }
        },

    }
</script>