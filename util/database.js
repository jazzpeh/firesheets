const admin = require('firebase-admin');

/**
 * Connects to FIrestore to import data
 */
class Database {
  /**
   * constructor
   * @param {string} credentials Path to firebase credential file
   * @param {string} database Name of the database in firebase
   */
  constructor(credentials, database) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentials;

    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: `https://${database}.firebaseio.com`,
    });

    /**
     * Connected firestore database
     * @type {admin.firestore.Firestore}
     */
    this.db = admin.firestore();

    /**
     * Keep a record of the row index to be used for unique ID
     * @type {Number}
     */
    this.rowIndex = 0;
  }

  /**
   * import data to firestore collection
   * @param {string} collection
   * @param {Array<Object>} data
   */
  async import(collection, data) {
    const batch = this.db.batch();
    const ref = this.db.collection(collection);

    for (const d of data) {
      batch.set(ref.doc(this.rowIndex.toString()), d);
      ++this.rowIndex;
    }

    const result = await batch.commit();

    return result;
  }

  /**
   * Reset the row index at will
   */
  resetRowIndex() {
    this.rowIndex = 0;
  }
}

module.exports = Database;
