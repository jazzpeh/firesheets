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

  /**
   * Replace all occurrences
   * @param {string} str
   * @param {string} searchValue
   * @param {string} replaceValue
   * @return {string}
   */
  static replaceAll(str, searchValue, replaceValue) {
    return str.split(searchValue).join(replaceValue);
  }

  /**
   * Split string by regex
   * @param {string} str
   * @param {RegExp} regex
   * @return {Array<string>}
   */
  static split(str, regex) {
    let match;
    let i = 0;
    let startIndex = i;
    const splitter = [];
    const builder = [];

    const cleanResult = (result) => {
      result = this.replaceAll(result, '\'', '');
      result = this.replaceAll(result, '"', '');
      result = this.trim(result);
      return result;
    };

    while (match = regex.exec(str)) {
      splitter.push({
        firstIndex: match.index,
        lastIndex: regex.lastIndex,
      });

      if (i > 0) {
        startIndex = splitter[i - 1].lastIndex;
      }

      let result = str.substring(startIndex, splitter[i].firstIndex);
      result = cleanResult(result);
      builder.push(result);

      ++i;
    }

    if (splitter.length > 0) {
      const lastSplit = splitter[splitter.length - 1];
      let result = str.substring(lastSplit.lastIndex, str.length);
      result = cleanResult(result);
      builder.push(result);
    } else {
      const result = cleanResult(str);
      builder.push(result);
    }

    return builder;
  }
}

module.exports = StringConverter;
