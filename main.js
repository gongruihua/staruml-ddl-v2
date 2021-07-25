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

const ddlGenerator = require('./src/generate/ddl-generator')
const columns = require('./column-define.json')
const {
  parseSQL
} = require('./src/parse/parse-sql')
const {
  addDefaultSystemColumn
} = require('./src/generate/add-columns')
const plantUmlGenerate = require('./src/generate/plantuml-generate')

function getGenOptions() {
  return {
    fileExtension: app.preferences.get('ddl.gen.fileExtension'),
    quoteIdentifiers: app.preferences.get('ddl.gen.quoteIdentifiers'),
    dropTable: app.preferences.get('ddl.gen.dropTable'),
    dbms: app.preferences.get('ddl.gen.dbms'),
    useTab: app.preferences.get('ddl.gen.useTab'),
    indentSpaces: app.preferences.get('ddl.gen.indentSpaces')
  }
}

/**
 * Command Handler for DDL Generation
 * sql ddl生成
 *
 * @param {Element} base
 * @param {string} path
 * @param {Object} options
 */
function _handleGenerate(base, path, options) {
  // 初始值为空
  // If options is not passed, get from preference
  options = options || getGenOptions()
  // If base is not assigned, popup ElementPicker
  if (!base) {
    // 选择ERDDataModel
    app.elementPickerDialog.showDialog('Select a data model to generate DDL', null, type.ERDDataModel).then(function ({
      buttonId,
      returnValue
    }) {
      if (buttonId === 'ok') {
        base = returnValue
        // If path is not assigned, popup Save Dialog to save a file
        if (!path) {
          var file = app.dialogs.showSaveDialog('Save DDL As...', null, null)
          if (file && file.length > 0) {
            path = file
            ddlGenerator.generate(base, path, options)
          }
        } else {
          ddlGenerator.generate(base, path, options)
        }
      }
    })
  } else {
    // If path is not assigned, popup Save Dialog to save a file
    if (!path) {
      var file = app.dialogs.showSaveDialog('Save DDL As...', null, null)
      if (file && file.length > 0) {
        path = file
        ddlGenerator.generate(base, path, options)
      }
    } else {
      ddlGenerator.generate(base, path, options)
    }
  }
}

/**
 * Popup PreferenceDialog with DDL Preference Schema
 */
function _handleConfigure() {
  app.commands.execute('application:preferences', 'ddl')
}

/**
 * add default columns to Entity
 */
function _handleAddColumns() {
  // 选择第一个
  if (global.$selectedModel) {
    if ($selectedModel instanceof type.ERDDataModel) {
      // 表明选择的是一个Model
      const selectedERDDataModel = $selectedModel
      console.log('选中了一个ERDDataModel', selectedERDDataModel)
    } else if ($selectedModel instanceof type.ERDEntity) {
      // 表明选择的是一个Entity
      const selectedERDEntity = $selectedModel
      console.log('选中了一个ERDEntity', selectedERDEntity)
      addDefaultSystemColumn(selectedERDEntity, columns)
    } else {
      console.log('未处理的选中类型', $selectedModel)
    }
  } else {
    app.toast.info("未选中任何模型")
  }
}

function _handleGenerateDataModel() {
  const dialog = app.dialogs.showTextDialog("Enter CREATE SQL", '');
  dialog.then(function ({
    buttonId,
    returnValue
  }) {
    if (buttonId === 'ok') {
      parseSQL(returnValue)
    } else {
      //User canceled
    }
  })
  const el = dialog.getElement()
  el.find('.k-textbox.text-box.primary')[0].focus()
  el.find('.k-button.dialog-button')[0].className += ' primary'
}

/**
 * Bypass validation :)
 */
function byPassvalidation() {
  let licenseInfo = app.licenseManager.getLicenseInfo()
  if (licenseInfo === null) {
    licenseInfo = {
      name: 'Valid',
      product: '',
      licenseType: 'PS',
      quantity: 'Valid',
      timestamp: '',
      licenseKey: '',
    }
    app.licenseManager.validate = () => {
      return new Promise((resolve, reject) => {
        resolve(licenseInfo)
      })
    }
    app.licenseManager.getLicenseInfo = () => (licenseInfo)
  }
}

/**
 * dataModel -> plantUml
 */
function _handleGeneratePlantUml() {
  if (global.$selectedModel instanceof type.ERDDataModel) {
    plantUmlGenerate.dataModelGenerate(global.$selectedModel)
  } else if (global.$selectedModel instanceof type.ERDEntity) {
    plantUmlGenerate.entityGenerate(global.$selectedModel)
  } else {
    app.toast.info("选择的不是数据模型或Entity,无法生成DataModel")
  }
}

function listenSelectionChangedEvent() {
  app.selections.on('selectionChanged', function (models, views) {
    global.$selectedModels = models
    if (Array.isArray(models)) {
      global.$selectedModel = models[0]
    }
    global.$selectedViews = views
    if (Array.isArray(views)) {
      global.$selectedView = views[0]
    }
  })
}

function init() {
  byPassvalidation()

  listenSelectionChangedEvent()

  app.commands.register('ddl:generate', _handleGenerate)
  app.commands.register('ddl:configure', _handleConfigure)
  app.commands.register('ddl:addColumns', _handleAddColumns)
  app.commands.register('ddl:generate-data-model', _handleGenerateDataModel)
  app.commands.register('ddl:data-model2PlantUml', _handleGeneratePlantUml)
}

exports.init = init