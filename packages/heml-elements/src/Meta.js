import HEML, { createElement } from '@heml/utils' // eslint-disable-line no-unused-vars

let metaMap

export default createElement('meta', {
  attrs: true,
  parent: [ 'head' ],

  preRender () { metaMap = new Map([ [ 'meta', [] ] ]) },

  render (attrs, contents) {
    metaMap.get('meta').push(attrs)

    return true
  },

  get (key) {
    return metaMap.get(key)
  },

  set (key, value) {
    return metaMap.set(key, value)
  },

  flush () {
    let metaObject = {}

    for (let [ key, value ] of metaMap) {
      metaObject[key] = value
    }

    metaMap = null

    return metaObject
  }
})
