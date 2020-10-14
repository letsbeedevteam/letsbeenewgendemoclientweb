import firebase from 'firebase';
import 'firebase/firestore'
import { FIREBASE } from './config';

// Initialize Firebase
firebase.initializeApp(FIREBASE.firestore);

const db = firebase.firestore();
const auth = firebase.auth();
const messaging = firebase.messaging();

export {
    db,
    auth,
    messaging
}