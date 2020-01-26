/**
 * String utilities
 */
class StringConverter {
  /**
   * Convert to all string to camel case
   * @param {string} str
   * @return {string}
   */
  static toCamelCase(str) {
    if (!str) return str;

    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  /**
   * Trim white spaces from string
   * @param {string} str
   * @return {string}
   */
  static trim(str) {
    if (!str) return str;
    return str.trim();
  }
}

module.exports = StringConverter;
