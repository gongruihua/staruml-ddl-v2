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
const ZERO_OR_ONE = "|o--"
const EXACTLY_ONE = "||--"
const ZERO_OR_MANY = "}o--"
const ONE_OR_MANY = "}|--"

const START_UML = "@startuml"
const END_UML = "@enduml"