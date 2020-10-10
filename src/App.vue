<template>
  <div id="app">
    <top-header></top-header>
    <router-view/>
  </div>
</template>

<script>
  import TopHeader from "./components/Top-Header"
  import { GOOGLE } from './config'

  export default {
    data() {
      return {
        isGoogleMap: false
      }
    },
    components: {'top-header': TopHeader},
    mounted() {
      if (!this.isGoogleMap) {
        let googleMapScript = document.createElement('script')
        googleMapScript.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=' + GOOGLE.map.key);
        document.head.appendChild(googleMapScript);
        this.isGoogleMap = true;
      }
    }
  }
</script>

<style lang="scss" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

@import url('./assets/css/style.css');
</style>
