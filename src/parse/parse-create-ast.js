const {
  trimSingleQuoted,
  isContainChinese
} = require('../utils/string-utils')
const {
  types
} = require('../utils/types')
const {
  createERDColumn
} = require('../utils/create-utils')
const {
  SetUtil
} = require('../utils/set-property-utils')

/**
 * 解析创建SQL的AST
 */
class ParseCreateAST {

  /**
   * constructor
   * @param {string} tableName
   * @param {type.Project} project
   * @param {type.ERDDataModel} dataModel
   * @param {object} createAst
   */
  constructor(tableName, project, dataModel, createAst) {
    /** @param string **/
    this.tableName = tableName

    /** @param type.Project **/
    this.project = project

    /** @param type.ERDDataModel **/
    this.dataModel = dataModel

    /** @param object **/
    this.createAst = createAst
  }

  parse() {
    const entity = app.factory.createModel({
      id: types.ERDEntity,
      parent: this.dataModel
    })

    const name = this.tableName + ' ' + this.getTableCommentFromCreateAst()
    SetUtil.setName(entity, name)

    const createDefinitions = this.createAst.create_definitions
    const columnsRef = {}

    createDefinitions.forEach(column => {
      if (column.resource === "column") {
        const columnTemp = generateColumn(column, entity)
        columnsRef[columnTemp.key] = columnTemp.column
      }
      if (column.resource === 'constraint' && column.constraint_type === 'primary key') {
        column.definition.forEach(key => {
          if (columnsRef[key]) {
            const col = columnsRef[key]
            SetUtil.setProperty(col, 'primaryKey', true)
          }
        })

      } else {
        console.warn('unsupport ast type', column)
      }
    })
  }

  getTableCommentFromCreateAst() {
    if (Array.isArray(this.createAst.table_options)) {
      for (const option of this.createAst.table_options) {
        if (option.keyword === 'comment') {
          return trimSingleQuoted(option.value)
        }
      }
    }
    return ''
  }
}

const generateColumn = (columnAst, entity) => {
  const column = createERDColumn(entity)
  let columnName = ''
  const columnDefinition = columnAst.column
  if (columnDefinition.type === 'column_ref') {
    columnName = columnDefinition.column
  } else {
    // no column name
    app.engine.deleteElements(column, [])
    console.error("can't find column name", columnAst)
    return null
  }

  let comment = ''
  if (columnAst.comment) {
    comment = columnAst.comment.value.value
  }

  let dataType = columnAst.definition.dataType
  // INT UNSIGNED
  if (Array.isArray(columnAst.definition.suffix)) {
    dataType += ` ${columnAst.definition.suffix.join(' ')}`
  }
  let length = columnAst.definition.length

  let isPrimary = false
  let isUnique = false
  //unique_or_primary: "primary key"
  if (columnAst.unique_or_primary) {
    if (columnAst.unique_or_primary.toLocaleLowerCase() === 'primary key') {
      isPrimary = true
    }
  }

  SetUtil.setProperties(column, {
    name: `${columnName} ${isContainChinese(comment) ? comment:''}`,
    type: dataType,
    length: length,
    primaryKey: isPrimary,
    documentation: comment
  })

  return {
    key: columnName,
    column: column
  }
}

/**
 * parseCreateAST
 * @param {string} tableName 
 * @param {type.Project} project 
 * @param {type.ERDDataModel} dataModel
 * @param {object} createAst 
 */
function parseCreateAST(tableName, project, dataModel, createAst) {
  const parseAST = new ParseCreateAST(tableName, project, dataModel, createAst)
  parseAST.parse()
}

exports.parseCreateAST = parseCreateAST