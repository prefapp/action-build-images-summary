const YAML = require('yaml')

class TextHelper {
  parseYaml(text) {
    return YAML.parse(text)
  }

  dumpYaml(object) {
    return YAML.stringify(object)
  }
}

module.exports = {
  TextHelper
}
