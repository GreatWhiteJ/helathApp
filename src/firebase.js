import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const config =  {
  apiKey: "AIzaSyBGgqxi6JJzP5VWJijVyYEWnFi0S0jT2-Y",
  authDomain: "health-tracker-d4cf0.firebaseapp.com",
  databaseURL: "https://health-tracker-d4cf0.firebaseio.com",
  projectId: "health-tracker-d4cf0",
  storageBucket: "health-tracker-d4cf0.appspot.com",
  messagingSenderId: "970844094577",
  appId: "1:970844094577:web:5c3b85a7c019b3e2dadbd0"
};

firebase.initializeApp(config);

export const auth = firebase.auth();

export const db = firebase.firestore();
