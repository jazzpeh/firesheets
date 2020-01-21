/* eslint-disable max-len */
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const StringConverter = require('./string-converter');

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
      SCOPE: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      TOKEN_PATH: 'token.json',
    };

    /**
     * The spreadsheet ID that is being read
     * @type {string|null}
     * @private
     */
    this.spreadsheetId;

    /**
     * Range to retrieve from the spreadsheet
     * @type {string|null}
     * @private
     */
    this.range;

    /**
     * File path to credentials
     * @type {string}
     * @private
     */
    this.credentials = credentials;
  }

  /**
   * initialize authorization and extract data from the google sheet
   * @param {string} spreadsheetId The spreadsheet ID that is being read
   * @param {string} range Range to retrieve from the spreadsheet
   * @return {Promise<Object>}
   */
  get(spreadsheetId, range) {
    this.spreadsheetId = spreadsheetId;
    this.range = range;

    return new Promise((resolve, reject) => {
      fs.readFile(this.credentials, (err, content) => {
        if (err) {
          console.log('Error loading client secret file:', err);
          reject(new Error(err));
        }
        // Authorize a client with credentials, then call the Google Sheets API.
        this.authorize(JSON.parse(content), (oAuth2Client) => {
          // Read data of the spreadsheet
          this.listMajors(oAuth2Client, resolve);
        });
      });
    });
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @private
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  authorize(credentials, callback) {
    // eslint-disable-next-line camelcase
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(this.settings.TOKEN_PATH, (err, token) => {
      if (err) return this.getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @private
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.settings.SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error while trying to retrieve access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(this.settingsTOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', this.settings.TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

  /**
   * Prints the names and majors of students in a sample spreadsheet:
   * @private
   * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
   * @param {function} callback The callback for the spreadsheet data
   */
  listMajors(auth, callback) {
    const data = {
      headers: [],
      rows: [],
    };

    const sheets = google.sheets({version: 'v4', auth});

    sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.range,
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const rows = res.data.values;

      if (rows.length) {
        rows.map((row, i) => {
          let dataRow = {};
          row.map((cell, j) => {
            // Row 1 is restricted for column names
            if (i === 0) {
              data.headers.push(StringConverter.toCamelCase(cell));
            } else {
              dataRow = {
                [StringConverter.toCamelCase(data.headers[j])]: cell,
                ...dataRow,
              };
            }
          });

          if (i > 0) {
            data.rows.push(dataRow);
          }
        });
      }

      callback(data);
    });
  }
}

module.exports = GSheets;
