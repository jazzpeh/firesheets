const admin = require('firebase-admin');
const config = require('config');
const {GSheets} = require('./utilities');

process.env.GOOGLE_APPLICATION_CREDENTIALS = config.get('firebase.credentials');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: `https://${config.get('firebase.database')}.firebaseio.com`,
});

const db = admin.firestore();
const gsheets = new GSheets('credentials.json');

(async () => {
  try {
    const data = await gsheets.get('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', 'Class Data!A1:E');
    console.log('success', data);
  } catch (e) {
    console.log('error', e);
  }
})();
