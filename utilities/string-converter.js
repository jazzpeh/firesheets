/**
 *
 */
class StringConverter {
  /**
   * Convert to all string to camel case
   * @param {*} str
   * @return {string}
   */
  static toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }
}

module.exports = StringConverter;
