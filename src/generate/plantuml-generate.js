const Mustache = require('mustache')
const fs = require('fs')
const clipboard = require('electron').clipboard

const showPlantUmlDialogTemplate = `
<div class="about-dialog dialog modal" data-title="Generate PlantUML">
  <div class="dialog-body">
      <pre v-data-m2324 class="plantuml-pre">{{plantuml}}</pre>
  </div>
  <div class="dialog-footer">
      <button class="k-button dialog-button primary" data-button-id="copy">复制</button>
  </div>
</div>
<style>
.plantuml-pre[v-data-m2324]{
  background-color: #3a3f41;
  font-family: inherit;
  max-height: 400px;
  overflow-x: auto;
}
<style>
`

/**
@startuml
  entity "Entity01" as e01 {
    * e1_id: number << generated >>
    --
    *
    name: text
    description: text
  }

  entity "Entity02" as e02 {
    * e2_id: number << generated >>
    --
    *
    e1_id: number << FK >>
    other_details: text
  }

  entity "Entity03" as e03 {
    * e3_id: number << generated >>
    --
    e1_id: number << FK >>
    other_details: text
  }

  e01 || ..o { e02
  e01 | o..o { e03
@enduml
*/
const MANY_FLAG_LEFT = '}|'
const MANY_FLAG_RIGHT = '|{'
const ONE_FLAG = '||'
const LINE = '--'

const START_UML = "@startuml"
const END_UML = "@enduml"

const ENTITY = "entity"

class Generate {
  /**
   * 
   */
  constructor() {
    this.entityArray = []
  }

  /**
   * add ERDEntity
   * @param {type.ERDEntity} entity 
   */
  addEntity(entity) {
    this.entityArray.push(entity)
  }

  toPlantUmlString() {
    const entityString = this.entityArray.map(entity => this.oneEntityToPlantUmlString(entity)).join('\n')
    const refString = this.entityArray.map(entity => this.oneEntityRelationshipToUmlString(entity)).join('\n')
    return `
${START_UML}
${entityString}
${refString}
${END_UML}
    `
  }

  oneEntityRelationshipToUmlString(entity) {
    const relationshipEndArray = entity.ownedElements.filter(item => item instanceof type.ERDRelationship)
    return relationshipEndArray.map(relationship => {
      if (relationship.end1.reference instanceof type.ERDEntity && relationship.end2.reference instanceof type.ERDEntity) {
        return `${this.getOneEntityName(relationship.end1.reference, true)} ${this.getRelationTag(relationship.end1.cardinality,'left')}${LINE}${this.getRelationTag(relationship.end2.cardinality,'right')}  ${this.getOneEntityName(relationship.end2.reference,true)}`
      } else {
        return ''
      }
    }).filter(str => str.length > 0).join('\n')
  }

  getRelationTag(cardinality, position) {
    switch (cardinality) {
      case '1':
        return ONE_FLAG
      case '0..*':
        return position === 'left' ? MANY_FLAG_LEFT : MANY_FLAG_RIGHT
      default:
        return null
    }
  }

  oneEntityToPlantUmlString(entity) {
    const entityName = this.getOneEntityName(entity)
    return `
${ENTITY} ${entityName} {
  ${this.oneEntityColumnsToPlatnUmlString(entity)}
}
    `
  }

  getOneEntityName(entity, isRef) {
    // 名字有可能为
    // name
    // name(alias)
    // name(cnname)
    // name(alias cnname)
    const rowName = entity.name.trim()
    if (/\w{1,}\s{0,}\(\s{0,}\w{1,}\s{1,}[\u4e00-\u9fa5_a-zA-Z0-9]{1,}\s{0,}\)/g.test(rowName)) {
      return rowName.replace(/(\w{1,})\s{0,}\(\s{0,}(\w{1,})\s{0,}([\u4e00-\u9fa5_a-zA-Z0-9]{1,})\s{0,}\)/, (a, b, c, d) => {
        return isRef ? `${c}` : `"${b}(${d})" as ${c}`
      })
    } else if (/\w{1,}\s{0,}\(\s{0,}\w{1,}\s{0,}\)/g.test(rowName)) {
      return rowName.replace(/(\w{1,})\s{0,}\(\s{0,}(\w{1,})\s{0,}\)/, (a, b, c, d) => {
        return isRef ? `${c}` : `"${b}" as ${c}`
      })
    } else if (/\w{1,}\s{0,}\(\s{0,}[\u4e00-\u9fa5_a-zA-Z0-9]{1,}\s{0,}\)/g.test(rowName)) {
      return rowName.replace(/(\w{1,})\s{0,}\(\s{0,}([\u4e00-\u9fa5_a-zA-Z0-9]{1,})\s{0,}\)/, (a, b, c, d) => {
        return isRef ? `${b}` : `"${b}(${c})"`
      })
    } else {
      return `"${rowName}"`
    }
  }

  oneEntityColumnsToPlatnUmlString(entity) {
    return entity.columns.
    filter((item) => item instanceof type.ERDColumn)
      .map(column => `${column.name}:${column.type}${column.length > 0 ? '(' + column.length + ')' : ''}`).join('\n  ')
  }
}

function dataModelGenerate(dataModel) {
  const entityArray = dataModel.ownedElements.filter(item => {
    return item instanceof type.ERDEntity
  })
  const plantUmlGenerate = new Generate()
  for (let entity of entityArray) {
    plantUmlGenerate.addEntity(entity)
  }
  const plantuml = plantUmlGenerate.toPlantUmlString()
  showPlantUmlInDlg(plantuml)
}

function entityGenerate(entity) {
  const plantUmlGenerate = new Generate()
  plantUmlGenerate.addEntity(entity)
  const plantuml = plantUmlGenerate.toPlantUmlString()
  showPlantUmlInDlg(plantuml)
}

function showPlantUmlInDlg(plantuml) {
  var dialog = app.dialogs.showModalDialogUsingTemplate(Mustache.render(showPlantUmlDialogTemplate, {
    plantuml: plantuml
  }))
  dialog.then(function () {
    clipboard.writeText(plantuml);
    app.toast.info("已复制到剪切板")
  })
  const el = dialog.getElement()
  el.find('.k-button.dialog-button.primary')[0].focus()
}

exports.dataModelGenerate = dataModelGenerate
exports.entityGenerate = entityGenerate