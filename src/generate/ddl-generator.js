/*
 * Copyright (c) 2014-2018 MKLab. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

const fs = require('fs')
const codegen = require('../utils/codegen-utils')

/**
 * DDL Generator
 */
class DDLGenerator {
  /**
   * @constructor
   *
   * @param {type.ERDDataModel} baseModel
   * @param {string} basePath generated files and directories to be placed
   */
  constructor(baseModel, basePath) {

    /** @member {type.Model} */
    this.baseModel = baseModel

    /** @member {string} */
    this.basePath = basePath
  }

  /**
   * Return Indent String based on options
   * @param {Object} options
   * @return {string}
   */
  getIndentString(options) {
    if (options.useTab) {
      return '\t'
    } else {
      var i, len
      var indent = []
      for (i = 0, len = options.indentSpaces; i < len; i++) {
        indent.push(' ')
      }
      return indent.join('')
    }
  };

  /**
   * Return Identifier (Quote or not)
   * @param {String} id table_name(short_name chinese_name)
   * @param {Object} options
   */
  getId(id, options) {
    if (options.dbms === 'new_mysql') {
      // 处理括号中内容
      if (id.indexOf('(') !== -1) {
        id = id.substring(0, id.indexOf('('))
      }
      // 处理空格,一般空格后是注释
      if (id.indexOf(' ') !== -1) {
        id = id.substring(0, id.indexOf(' '))
      }
    }
    if (options.quoteIdentifiers) {
      return '`' + id + '`'
    }
    return id
  }

  /**
   * Return Primary Keys for an Entity
   * @param {type.ERDEntity} elem
   * @return {Array.<ERDColumn>}
   */
  getPrimaryKeys(elem) {
    var keys = []
    elem.columns.forEach(function (col) {
      if (col.primaryKey) {
        keys.push(col)
      }
    })
    return keys
  }

  /**
   * Return Foreign Keys for an Entity
   * @param {type.ERDEntity} elem
   * @return {Array.<ERDColumn>}
   */
  getForeignKeys(elem) {
    var keys = []
    elem.columns.forEach(function (col) {
      if (col.foreignKey) {
        keys.push(col)
      }
    })
    return keys
  }

  /**
   * 
   * @param {type.ERDEntity} elem
   */
  getColComent(elem) {
    const name = elem.name
    const spachIndex = name.indexOf(' ')
    if (spachIndex !== -1) {
      return ' COMMENT \'' + name.substring(spachIndex + 1) + '\''
    }
    return ''
  }

  /**
   * 
   * 获取默认值
   * */
  getTagDefaultValue(tagElements) {
    if(tagElements) {
      for (let tag of tagElements) {
        const tag_name = tag.name
        const tag_kind = tag.kind
        const tag_value = tag.value 
        if (tag_name == 'default_value') {
           if(tag_kind == 'string') {
            return ' DEFAULT \'' + tag_value + '\''
           }else {
             return ' DEFAULT ' + tag_value + ''
           }
        }
      }
    }
     
    return ''
  }


  /**
   * Return DDL column string
   * @param {type.ERDColumn} elem
   * @param {Object} options
   * @return {String}
   */
  getColumnString(elem, options) {
    var self = this
    var line = self.getId(elem.name, options)
    var _type = elem.getTypeString()
    if (_type.trim().length === 0) {
      _type = 'INTEGER'
    }
    line += ' ' + _type
    if (elem.primaryKey || !elem.nullable) {
      line += ' NOT NULL'
    }
    if (options.dbms === 'new_mysql') {
      //添加默认值
      const default_value = self.getTagDefaultValue(elem.tags)
      line += default_value
      // 增加注释
      const colComent = self.getColComent(elem)
      line += colComent
    }
    return line
  }


  /**
   * Return table comment
   * @param {type.ERDEntity} elem 
   */
  getTableComment(elem) {
    // table_name(table_short_name table_chinese_name)
    const name = elem.name
    if (name.indexOf('(') !== -1 && name.indexOf(')') !== -1) {
      const descName = name.substring(name.indexOf('(') + 1, name.indexOf(')'))
      return '\'' + descName.substring(descName.indexOf(' ') + 1) + '\''
    }
    return ''
  }

  /**
   * Write Foreign Keys
   * @param {StringWriter} codeWriter
   * @param {type.ERDEntity} elem
   * @param {Object} options
   */
  writeForeignKeys(codeWriter, elem, options) {
    var self = this
    var fks = self.getForeignKeys(elem)
    var ends = elem.getRelationshipEnds(true)

    ends.forEach(function (end) {
      if (end.cardinality === '1') {
        var _pks = self.getPrimaryKeys(end.reference)
        if (_pks.length > 0) {
          var matched = true
          var matchedFKs = []
          _pks.forEach(function (pk) {
            var r = fks.find(function (k) {
              return k.referenceTo === pk
            })
            if (r) {
              matchedFKs.push(r)
            } else {
              matched = false
            }
          })

          if (matched) {
            fks = fks.filter(e => {
              return !matchedFKs.includes(e)
            })
            var line = 'ALTER TABLE '
            line += self.getId(elem.name, options) + ' '
            line += 'ADD FOREIGN KEY (' + matchedFKs.map(function (k) {
              return self.getId(k.name, options)
            }).join(', ') + ') '
            line += 'REFERENCES ' + self.getId(_pks[0]._parent.name, options)
            line += '(' + _pks.map(function (k) {
              return self.getId(k.name, options)
            }) + ');'
            codeWriter.writeLine(line)
          }
        }
      }
    })
    fks.forEach(function (fk) {
      if (fk.referenceTo) {
        var line = 'ALTER TABLE '
        line += self.getId(elem.name, options) + ' '
        line += 'ADD FOREIGN KEY (' + self.getId(fk.name, options) + ') '
        line += 'REFERENCES ' + self.getId(fk.referenceTo._parent.name, options)
        line += '(' + self.getId(fk.referenceTo.name, options) + ');'
        codeWriter.writeLine(line)
      }
    })
  }

  /**
   * Write Drop Table
   * @param {StringWriter} codeWriter
   * @param {type.ERDEntity} elem
   * @param {Object} options
   */
  writeDropTable(codeWriter, elem, options) {
    if (options.dbms === 'mysql' || options.dbms === 'new_mysql') {
      codeWriter.writeLine('DROP TABLE IF EXISTS ' + this.getId(elem.name, options) + ';')
    } else if (options.dbms === 'oracle') {
      codeWriter.writeLine('DROP TABLE ' + this.getId(elem.name, options) + ' CASCADE CONSTRAINTS;')
    }
  }

  /**
   * Write Table
   * @param {StringWriter} codeWriter
   * @param {type.ERDEntity} elem
   * @param {Object} options
   */
  writeTable(codeWriter, elem, options) {
    var self = this
    var lines = []
    var primaryKeys = []
    var uniques = []

    // Table
    codeWriter.writeLine('CREATE TABLE ' + self.getId(elem.name, options) + ' (')
    codeWriter.indent()

    // Columns
    elem.columns.forEach(function (col) {
      if (col.primaryKey) {
        primaryKeys.push(self.getId(col.name, options))
      }
      if (col.unique) {
        uniques.push(self.getId(col.name, options))
      }
      lines.push(self.getColumnString(col, options))
    })

    // Primary Keys
    if (primaryKeys.length > 0) {
      lines.push('PRIMARY KEY (' + primaryKeys.join(', ') + ')')
    }

    // Uniques
    if (uniques.length > 0) {
      lines.push('UNIQUE (' + uniques.join(', ') + ')')
    }

    // Write lines
    for (var i = 0, len = lines.length; i < len; i++) {
      codeWriter.writeLine(lines[i] + (i < len - 1 ? ',' : ''))
    }

    codeWriter.outdent()
    // table Comment
    if (options.dbms === 'new_mysql') {
      const tableComment = self.getTableComment(elem)
      if (tableComment != '') {
        codeWriter.writeLine(') COMMENT ' + tableComment + ";")
      } else {
        codeWriter.writeLine(');')
      }
    } else {
      codeWriter.writeLine(');')
    }
    codeWriter.writeLine()
  }

  /**
   * Generate codes from a given element
   * @param {type.Model} elem
   * @param {string} path
   * @param {Object} options 配置信息
   * @return {$.Promise}
   */
  generate(elem, basePath, options) {
    var codeWriter
    // DataModel
    if (elem instanceof type.ERDDataModel) {
      const indentString = this.getIndentString(options)
      codeWriter = new codegen.CodeWriter(indentString)

      // Drop Tables
      if (options.dropTable) {
        if (options.dbms === 'mysql' || options.dbms === 'new_mysql') {
          codeWriter.writeLine('SET FOREIGN_KEY_CHECKS = 0;')
        }
        elem.ownedElements.forEach(e => {
          if (e instanceof type.ERDEntity) {
            this.writeDropTable(codeWriter, e, options)
          }
        })
        if (options.dbms === 'mysql' || options.dbms === 'new_mysql') {
          codeWriter.writeLine('SET FOREIGN_KEY_CHECKS = 1;')
        }
        codeWriter.writeLine()
      }

      // Tables
      elem.ownedElements.forEach(e => {
        if (e instanceof type.ERDEntity) {
          this.writeTable(codeWriter, e, options)
        }
      })

      // Foreign Keys
      // new_mysql 外键不需要
      if (options.dbms !== 'new_mysql') {
        elem.ownedElements.forEach(e => {
          if (e instanceof type.ERDEntity) {
            this.writeForeignKeys(codeWriter, e, options)
          }
        })
      }

      // Others (Nothing generated.)
      fs.writeFileSync(basePath, codeWriter.getData())
    }
  }
}

/**
 * Generate
 * @param {type.Model} baseModel
 * @param {string} basePath
 * @param {Object} options
 */
function generate(baseModel, basePath, options) {
  var generator = new DDLGenerator(baseModel, basePath)
  return generator.generate(baseModel, basePath, options)
}

exports.generate = generate