<template>
  <div id="app">
    <top-header></top-header>
    <router-view/>
  </div>
</template>

<script>
  import TopHeader from "./components/Top-Header"
  import { GOOGLE } from "./config"

  export default {
    components: {'top-header': TopHeader},
    mounted() {
      if (!document.getElementById("googleMapScript")) {
        let googleMapScript = document.createElement('script');
        googleMapScript.setAttribute("id", "googleMapScript");
        googleMapScript.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=' + GOOGLE.map.key);
        document.head.appendChild(googleMapScript);
      }
    }
  }
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

@import url('assets/css/style.css');
</style>
