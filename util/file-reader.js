const fs = require('fs');

/**
 * File utilities
 */
class FileReader {
  /**
   * Read json file and return a json object
   * @param {String} filePath
   * @return {Promise<Object>}
   */
  static readJsonFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) reject(err);
        else resolve(JSON.parse(data));
      });
    });
  }
}

module.exports = FileReader;
