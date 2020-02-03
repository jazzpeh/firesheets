/* eslint-disable max-len */

const colors = require('colors/safe');
const argv = require('yargs').argv;
const logSymbols = require('log-symbols');
const _ = require('lodash');

const {Database, FileReader, GSheets} = require('./util');

/**
 * Main program to execute
 */
class Program {
  /**
   * Run program storyboard
   */
  async run() {
    if (argv.version) {
      await this.displayVersion();
      return;
    }

    this.validateArgs();
    const data = await this.retrieveSheetData();
    await this.importSheetDataToFirebase(data);
  }

  /**
   * Read `sheetId` and `credentials` and retrieve sheet data
   * @return {Array<Object>}
   */
  async retrieveSheetData() {
    const {
      sheet: {
        cred,
        id,
      },
    } = argv;

    console.log(`\nRetrieving ${colors.green('[Google Sheet]')} data...`);
    const gsheets = new GSheets(cred);
    const data = await gsheets.get(id);

    console.log(logSymbols.success, 'Successfully retrieved Google sheet data. \n');

    return data;
  }

  /**
   * Import sheet data into Firebase
   * @param {Array<Object>} data
   */
  async importSheetDataToFirebase(data) {
    const maxDocsPerBatch = 500;
    const errors = [];
    const {
      db: {
        cred,
        name,
      },
    } = argv;

    const firebaseLogMsg = colors.red('[Firebase]');
    console.log(`Starting process to import data to ${firebaseLogMsg}...`);
    const fb = new Database(cred, name);

    for (const {collection, rows} of data) {
      fb.resetRowIndex();

      const results = [];
      const collectionLogText = colors.cyan(`[${collection}]`);

      console.log(`\nChunking data to max ${colors.cyan(`[${maxDocsPerBatch}]`)} documents per batch for collection ${collectionLogText}...`);
      const chunkedRows = _.chunk(rows, maxDocsPerBatch);
      console.log(logSymbols.success, 'Data successfully chunked.');

      for (let i = 0, len = chunkedRows.length; i < len; ++i) {
        const dataToImport = chunkedRows[i];
        const logMsg = `${colors.cyan(`(${i + 1} / ${chunkedRows.length})`)} chunked data`;
        try {
          await fb.import(collection, dataToImport);
          console.log(logSymbols.success, `${logMsg} imported.`);
          results.push(i);
        } catch (err) {
          errors.push(err);
          console.log(logSymbols.error, `${logMsg} not imported.`);
        }
      }

      if (results.length === chunkedRows.length) {
        console.log(logSymbols.success, colors.green(`All documents are successfully imported for ${collectionLogText}`));
      } else {
        const failedCount = chunkedRows.length - results.length;
        console.log(colors.red(`${failedCount} batch${failedCount > 1 ? 'es' : ''} of documents failed to be imported for ${collectionLogText}.`));
      }
    }

    if (errors.length > 0) {
      throw errors;
    } else {
      console.log(`\n${logSymbols.success}`, `Successfully imported all data to ${firebaseLogMsg}.\n`);
    }
  }

  /**
   * Show current package version
   */
  async displayVersion() {
    try {
      const packageFile = `${__dirname}/package.json`;
      const packageData = await FileReader.readJsonFile(packageFile);
      console.log(packageData.version);
    } catch (error) {
      const errorMsg = 'Unable to retrieve package version...';
      console.log(logSymbols.error, colors.red(errorMsg));
    }
  }

  /**
   * Validate arguments
   */
  validateArgs() {
    const {sheet, db} = argv;
    const errs = [];

    if (!sheet) {
      errs.push('`sheet.id` and `sheet.cred` arguments are required.');
    } else {
      if (!sheet.id) {
        errs.push('`sheet.id` argument is required.');
      }

      if (!sheet.cred) {
        errs.push('`sheet.cred` argument is required.');
      }
    }

    if (!db) {
      errs.push('`db.name` and `db.cred` arguments are required.');
    } else {
      if (!db.cred) {
        errs.push('`db.cred` argument is required.');
      }

      if (!db.name) {
        errs.push('`db.name` argument is required.');
      }
    }

    if (errs.length > 0) {
      const errorStr = errs.join(' ');
      throw new Error(errorStr);
    }
  }
}

module.exports = Program;
