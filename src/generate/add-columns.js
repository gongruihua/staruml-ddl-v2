const {
  createERDColumn
} = require('../utils/create-utils')

class AddColumns {
  /**
   * constructor
   * @param {type.ENTITY} parent
   * @param {Array} columns 
   */
  constructor(parent, columns) {
    this.parent = parent
    this.columns = columns
  }

  /**
   * generate columns form entity
   */
  generate() {
    this.columns.forEach((column) => {
      const col = createERDColumn(parent)
      Object.keys(column).forEach((attribute) => {
        app.engine.setProperty(col, attribute, column[attribute])
      })
    })
  }
}



/**
 * constructor
 * @param {type.ENTITY} parent
 * @param {Array} columns 
 */
const addDefaultSystemColumn = (parent, columns) => {
  const adder = new AddColumns(parent, columns)
  adder.generate()
}

exports.addDefaultSystemColumn = addDefaultSystemColumn