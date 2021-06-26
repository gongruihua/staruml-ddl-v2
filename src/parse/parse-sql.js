const {
  Parser
} = require('node-sql-parser')
const {
  parseCreateAST
} = require('./parse-create-ast')
const parser = new Parser()

function parseAST(ast) {
  const tableName = getTableName(ast)

  if (tableName === null) {
    app.toast.error("can't find tableName")
    throw new Error("can't find tableName")
  }

  let project = null
  let dataModel = null
  if (global.$selectedModel instanceof type.Project) {
    project = $selectedModel
  } else if (global.$selectedModel instanceof type.ERDDataModel) {
    dataModel = $selectedModel
  } else {
    project = app.repository.select("@Project")[0]
  }

  // 当前没有选中dataModel
  if (dataModel == null) {
    dataModel = app.factory.createModel({
      id: "ERDDataModel",
      parent: project
    })
  }

  if (ast.type === 'create') {
    parseCreateAST(tableName, project, dataModel, ast)
  } else {
    app.toast.info(`UnSupport SQL TYPE:${ast.type}`)
  }
}

function getTableName(ast) {
  if (ast.type === 'create') {
    return ast.table[0].table
  }
  return null
}

function parseSQL(sql) {
  let ast = null
  try {
    ast = parser.astify(sql)
  } catch (error) {
    console.error('sql parse fial', error)
    app.toast.info("sql parse fail")
    return
  }
  if (Array.isArray(ast)) {
    ast.forEach(item => parseAST(item))
  } else {
    parseAST(ast)
  }
}

exports.parseSQL = parseSQL