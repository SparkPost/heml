import HEML, { createElement } from '@heml/utils' // eslint-disable-line no-unused-vars
import Meta from './Meta'

export default createElement('subject', {
  parent: [ 'head' ],
  unique: true,

  render (attrs, contents) {
    Meta.set('subject', contents)

    return false
  },

  flush () {
    return Meta.get('subject') || ''
  }
})
