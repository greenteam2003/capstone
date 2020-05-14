import * as firebase from 'firebase';
const config = {
  apiKey: 'AIzaSyAkB0IcCczv1WaEkvzSigwEVBfoEDPHQLw',
  authDomain: 'grouphang-258f0.firebaseapp.com',
  databaseURL: 'https://grouphang-258f0.firebaseio.com',
  projectId: 'grouphang-258f0',
  storageBucket: 'grouphang-258f0.appspot.com',
  messagingSenderId: '1099355694480',
  appId: '1:1099355694480:web:c6da36b5250772cdf1bf15',
  measurementId: 'G-L9RRLVGJ44',
};
export const fire = firebase.initializeApp(config);
export const db = fire.database();
