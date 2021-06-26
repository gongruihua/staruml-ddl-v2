function trimSingleQuoted(str) {
  if (str) {
    if (str.startsWith("'")) {
      str = str.substr(1)
    }
    if (str.endsWith("'")) {
      str = str.substr(0, str.length - 1)
    }
    return str
  }
  return ''
}

function isContainChinese(str) {
  let reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
  return reg.test(str)
}

exports.trimSingleQuoted = trimSingleQuoted
exports.isContainChinese = isContainChinese