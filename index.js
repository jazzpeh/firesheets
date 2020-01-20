const admin = require('firebase-admin');
const config = require('config');

process.env.GOOGLE_APPLICATION_CREDENTIALS = config.get('firebase.credentials');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: `https://${config.get('firebase.database')}.firebaseio.com`,
});

const db = admin.firestore();
