<template>
  <div id="app">
    <top-header></top-header>
    <loader></loader>
    <router-view/>
  </div>
</template>

<script>
  import TopHeader from "./components/Top-Header"
  import Loader from "./components/Loader"

  export default {
    components: {
      'top-header': TopHeader,
      'loader': Loader,
    },
  }
</script>

<style scoped>
  @import url('assets/css/style.css');
</style>
