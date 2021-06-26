const {
  types
} = require('./types')

/**
 * create new Column for `parent`
 * @param {type.ERDDataModel} parent 
 * @returns {type.ERDColumn} 
 */
function createERDColumn(parent) {
  return app.factory.createModel({
    id: types.ERDColumn,
    parent: parent,
    field: "columns"
  })
}

exports.createERDColumn = createERDColumn