import firebase from 'firebase';
import 'firebase/firestore'
import { FIREBASE } from './config';

// Initialize Firebase
firebase.initializeApp(FIREBASE.firestore);

const db = firebase.firestore();
const auth = firebase.auth();
const messaging = firebase.messaging();

const userCollection = db.collection("users");
const riderCollection = db.collection("riders");
const restaurantCollection = db.collection("restaurants")
const orderCollection = db.collection("customer_orders");

export {
    db,
    auth,
    messaging,
    userCollection,
    riderCollection,
    restaurantCollection,
    orderCollection
}