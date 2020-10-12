<template>
    <div class="container">

        <h1>Update your Delivery Address</h1>

        <div id="map" ref="setAddress"></div>

        <div class="text-right mt-3">
            <button type="button" v-bind:class="[btnClass, saveLocation ? '' : 'disabled']" @click="updateLocation"> Save</button>
        </div>
    </div>
</template>

<script>

    import { db } from '../firebase-config';
    import firebase from 'firebase';

    const userCollection = db.collection("users");
    // var position = {lat: 15.1450545, lng: 120.5894371};

    export default {
        data() {
            return {
                auth: null,
                authRef: null,
                btnClass: 'btn btn-primary',
                saveLocation: false,
                position: {lat: 15.1450545, lng: 120.5894371}
            }
        },
        created() {
            this.$session.start();
            this.authRef = userCollection.doc(this.$session.get("auid"));
            this.authRef.get().then(
                (result) => {
                    this.auth = {id: result.id, ...result.data()} 
                    if (this.auth.location !== null) {
                        this.position.lat = this.auth.location.latitude;
                        this.position.lng = this.auth.location.longitude;
                    }
                }
            );
        },
        mounted() {
            var mapEl = document.getElementById("map");
            if (mapEl) {
                mapEl.setAttribute("ref", "setAddress");
            }

            var _this = this;
            var map = new window.google.maps.Map(this.$refs.setAddress, {
                center: this.position,
                zoom: 14,
                streetViewControl: false,
                mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true 
            });

            var infoWindow = new window.google.maps.InfoWindow({content: 'Your place', position: this.position});
            map.addListener('click', function(mapsMouseEvent) {
                infoWindow.close();
                infoWindow = new window.google.maps.InfoWindow({content: 'Your place', position: mapsMouseEvent.latLng});
                infoWindow.open(map);

                _this.position.lat = mapsMouseEvent.latLng.lat();
                _this.position.lng = mapsMouseEvent.latLng.lng();
                
                _this.saveLocation = true;
            });

            infoWindow.open(map);
        },
        methods: {
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
    #map {
        height: 600px;
        background-color: grey;
    }
</style>