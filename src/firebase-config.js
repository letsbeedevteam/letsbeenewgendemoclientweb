import firebase from 'firebase';
import 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBKa8G7K7nH4vYHxEYNvIrdNHk7YSjFp98",
    authDomain: "lets-bee-f9e7d.firebaseapp.com",
    databaseURL: "https://lets-bee-f9e7d.firebaseio.com",
    projectId: "lets-bee-f9e7d",
    storageBucket: "lets-bee-f9e7d.appspot.com",
    messagingSenderId: "959247206949",
    appId: "1:959247206949:web:a7fe280cbbba915634cdcc",
    measurementId: "G-F5E63TFDH5"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

const db = firebase.firestore();
const auth = firebase.auth();

export {
    db,
    auth
}