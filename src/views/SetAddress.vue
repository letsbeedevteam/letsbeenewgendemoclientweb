<template>
    <div class="container">

        <h1>Update your Delivery Address</h1>

        <div id="customerAddressMap" ref="customerAddressMap"></div>

        <div class="text-right mt-3">
            <button type="button" v-bind:class="[btnClass, saveLocation ? '' : 'disabled']" @click="updateLocation"> Save</button>
        </div>
    </div>
</template>

<script>
    import firebase from 'firebase'
    import GoogleMapsApiLoader from 'google-maps-api-loader'
    import { userCollection } from '../firebase-config'
    import { GOOGLE } from '../config'

    export default {
        data() {
            return {
                auth: null,
                authRef: null,
                btnClass: 'btn btn-primary',
                saveLocation: false,
                position: {lat: 15.1450545, lng: 120.5894371},
                google: null,
                map: null
            }
        },
        created() {
            this.$session.start();
            this.authRef = userCollection.doc(this.$session.get("auid"));
            this.authRef.get().then(
                (result) => {
                    this.auth = {id: result.id, ...result.data()} 
                    if (this.auth.location.latitude == 0 && this.auth.location.longitude) {
                        this.position.lat = this.auth.location.latitude;
                        this.position.lng = this.auth.location.longitude;
                    }
                }
            );
        },
        
        async mounted() {
            const googleMapApi = await GoogleMapsApiLoader({
                apiKey: GOOGLE.map.key
            }).catch(err => {
                console.log(err);
                alert("Something went wrong on Google Map. Please try refreshing the page");
            });
            
            this.google = googleMapApi;
            this.initializeMap();
        },

        methods: {
            initializeMap() {
                this.map = new this.google.maps.Map(this.$refs.customerAddressMap, {
                    center: this.position,
                    zoom: 14,
                    streetViewControl: false,
                    mapTypeId: this.google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true 
                });

                var _this = this;
                var infoWindow = new this.google.maps.InfoWindow({content: 'Your place', position: this.position});
                this.map.addListener('click', function(mapsMouseEvent) {
                    infoWindow.close();
                    infoWindow = new _this.google.maps.InfoWindow({content: 'Your place', position: mapsMouseEvent.latLng});
                    infoWindow.open(_this.map);

                    _this.position.lat = mapsMouseEvent.latLng.lat();
                    _this.position.lng = mapsMouseEvent.latLng.lng();
                    
                    _this.saveLocation = true;
                });

                infoWindow.open(_this.map);
            },

            updateLocation: function() {
                if (this.saveLocation) {
                    this.authRef.update({
                        location: new firebase.firestore.GeoPoint(this.position.lat, this.position.lng)
                    }).then(() => {
                        alert("successfully updated");
                    });
                } else {
                    alert("invalid request");
                }
            },
        },
        
        beforeDestroy() {
            this.auth = null;
            this.authRef = null;
        }
    }
</script>

<style lang="scss" scoped>
    #customerAddressMap {
        height: 600px;
        background-color: grey;
    }
</style>