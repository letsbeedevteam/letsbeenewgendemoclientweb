import firebase from 'firebase';
import 'firebase/firestore'
import { FIREBASE } from './config';

// Initialize Firebase
firebase.initializeApp(FIREBASE);

const db = firebase.firestore();
const auth = firebase.auth();

export {
    db,
    auth
}