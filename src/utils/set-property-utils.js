const SetUtil = {}

SetUtil.setProperties = (obj, fieldKeyValueMap) => {
  app.engine.setProperties(obj, fieldKeyValueMap)
}

SetUtil.setProperty = (obj, key, value) => {
  app.engine.setProperty(obj, key, value)
}

SetUtil.setName = (obj, name) => {
  SetUtil.setProperty(obj, 'name', name)
}

exports.SetUtil = SetUtil