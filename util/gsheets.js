/* eslint-disable max-len */
const colors = require('colors/safe');
const fs = require('fs');
const util = require('util');
const readline = require('readline');
const {google} = require('googleapis');
const StringConverter = require('./string-converter');
const readFile = util.promisify(fs.readFile);
/**
 * Utility to authorize and read Google sheets
 */
class GSheets {
  /**
   * constructor
   * @param {string} credentials The file path to the credentials.json file
   */
  constructor(credentials) {
    /**
     * Settings
     * @type {enum}
     * @private
     */
    this.settings = {
      SCOPES: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      TOKEN_PATH: 'token.json',
    };

    /**
     * File path to credentials
     * @type {string}
     * @private
     */
    this.credentials = credentials;

    /**
     * Google sheet auth client
     * @type {google.auth.OAuth2}
     * @private
     */
    this.oAuth2Client;

    /**
     * Split regex pattern - split by comma, but avoid comma that is enclosed inside a single/double quote
     * To be used with StringConverter.split
     * @type {RegExp}
     * @private
     */
    this.splitRegex = /,(?=([^('|")]*('|")[^('|")]*('|"))*[^('|")]*$)/g;
  }

  /**
   * initialize authorization and extract data from the google sheet
   * @param {string} spreadsheetId The spreadsheet ID that is being read
   * @param {string} range Range to retrieve from the spreadsheet
   * @return {Array<Object>}
   */
  async get(spreadsheetId, range = 'A1:Z1000') {
    const content = await readFile(this.credentials);

    // Authorize a client with credentials, then call the Google Sheets API.
    await this.authorize(JSON.parse(content));

    // Read data of the spreadsheet
    return await this.listMajors(spreadsheetId, range);
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @private
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  async authorize(credentials) {
    // eslint-disable-next-line camelcase
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    this.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    try {
      const token = await readFile(this.settings.TOKEN_PATH);
      this.oAuth2Client.setCredentials(JSON.parse(token));
    } catch (error) {
      await this.getNewToken();
    }
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @private
   * @return {Promise<void>}
   */
  getNewToken() {
    return new Promise((resolve, reject) => {
      const authUrl = this.oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: this.settings.SCOPES,
      });

      console.log(colors.cyan('Authorize this app by visiting this url:'), authUrl);

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(colors.cyan('Enter the code from that page here: '), (code) => {
        rl.close();

        this.oAuth2Client.getToken(code, (err, token) => {
          if (err) reject(new Error(err));

          this.oAuth2Client.setCredentials(token);

          // Store the token to disk for later program executions
          fs.writeFile(this.settings.TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) reject(new Error(err));

            console.log(colors.cyan('Token stored to'), this.settings.TOKEN_PATH);
            resolve();
          });
        });
      });
    });
  }

  /**
   * Prints the names and majors of students in a sample spreadsheet:
   * @param {string} spreadsheetId The spreadsheet ID that is being read
   * @param {string} range Range to retrieve from the spreadsheet
   * @private
   * @return {Array<Object>}
   */
  async listMajors(spreadsheetId, range) {
    const data = [];

    const sheets = google.sheets({version: 'v4', auth: this.oAuth2Client});

    const allSheets = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });

    const ranges = allSheets.data.sheets.map((s) => `${s.properties.title}!${range}`);


    const result = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: spreadsheetId,
      ranges,
    });

    result.data.valueRanges.map((s, index) => {
      const rows = [];
      const headers = [];
      let collection = '';

      const currentCollection = allSheets.data.sheets.find((s) => s.properties.index === index);

      if (!currentCollection) return;
      collection = currentCollection.properties.title;

      if (!s.values) return;

      s.values.map((row, i) => {
        let dataRow = {};

        row.map((cell, j) => {
          // Row 1 is restricted for column names
          if (i === 0) {
            const extractType = cell.match(/<([^)]+)>/);
            const type = StringConverter.trim(extractType ? extractType[1] : 'String');
            const value = StringConverter.toCamelCase(StringConverter.trim(cell.replace(`<${type}>`, '')));
            headers.push({value, type});
          } else {
            const header = headers[j];

            dataRow = {
              [header.value]: this.toDataType(cell, header.type),
              ...dataRow,
            };
          }
        });

        if (i > 0) {
          rows.push(dataRow);
        }
      });

      data.push({collection, headers, rows});
    });

    return data;
  }

  /**
   * Convert data retrieved from Google sheet to their correct data format for firestore
   * @param {String} data Data that needs to be converted, typically it's a string value
   * @param {String} type Data type to convert data provided to
   * @return {any}
   */
  toDataType(data, type) {
    const isArray = type.indexOf('[') > -1 && type.indexOf(']') > -1;
    let result = null;

    if (isArray) {
      type = type.replace('[]', '');
      result = [];
      let dataArr =[];

      if (type.toLowerCase() === 'map') {
        dataArr = data.split(',,');
      } else {
        dataArr = StringConverter.split(data, this.splitRegex);
      }

      for (const d of dataArr) {
        const typeResult = this.switchDataType(d, type);
        if (typeResult === '' || typeResult === undefined || typeResult === null) continue;
        result.push(typeResult);
      }
    } else {
      result = this.switchDataType(data, type);
    }

    return result;
  }

  /**
   * Used in conjunction with toDataType to solve sub problems
   * @param {String} data
   * @param {String} type
   * @return {any}
   */
  switchDataType(data, type) {
    switch (type.toLowerCase()) {
      case 'map': {
        let mapData = {};
        let propCount = 0;
        const dataSplit = StringConverter.split(data, this.splitRegex);

        for (const d of dataSplit) {
          const keyValueSplit = d.split(':');
          if (keyValueSplit.length === 0) continue;
          if (!keyValueSplit[0]) continue;

          const trimKey = StringConverter.trim(keyValueSplit[0]);
          const camelCaseKey = StringConverter.toCamelCase(trimKey);

          mapData = {
            [camelCaseKey]: StringConverter.trim(keyValueSplit[1]),
            ...mapData,
          };

          ++propCount;
        }

        return propCount > 0 ? mapData : null;
      }
      case 'number': {
        if (data) {
          return data.indexOf('.') > -1 ? parseFloat(data) : parseInt(data);
        } else {
          return data;
        }
      }
      case 'bool':
        return data !== undefined && data !== null && data.toLowerCase() === 'true' ? true : false;
      default: // Default as string
        return StringConverter.trim(data ? data.toString() : data);
    }
  }
}

module.exports = GSheets;
