<template>
  <div id="app">
    <top-header></top-header>
    <router-view/>
  </div>
</template>

<script>
  import TopHeader from "./components/Top-Header"

  export default {
    components: {'top-header': TopHeader},
  }
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
}

@import url('assets/css/style.css');
</style>
