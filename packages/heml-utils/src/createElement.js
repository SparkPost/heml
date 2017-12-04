import { defaults, isFunction, mapKeys, mapValues } from 'lodash'
import hash from './hash'

const textRegex = /^(text(-([^-\s]+))?(-([^-\s]+))?|word-(break|spacing|wrap)|line-break|hanging-punctuation|hyphens|letter-spacing|overflow-wrap|tab-size|white-space|font-family|font-weight|font-style|font-variant|color)$/i

export default function (name, element) {
  if (!name || name.trim().length === 0) {
    throw new Error(`When creating an element, you must set the name. ${name.trim().length === 0 ? 'An empty string' : `"${name}"`} was given.`)
  }

  if (isFunction(element)) {
    element = { render: element }
  }

  if (element.rules) {
    element.rules = mapValues(element.rules, (decls, key) => {
      return [ { '@pseudo': key }, ...decls ]
    })

    element.rules = mapKeys(element.rules, (decls, key) => {
      return `.${hash(name)}__${key}`
    })
  }

  if (element.containsText) {
    element.rules = element.rules || {}
    element.rules['.header'] = [ textRegex ]
    element.rules['.text'] = [ textRegex, 'font-size', 'line-height' ]
  }

  element = defaults({}, element || {}, {
    tagName: name.trim().toLowerCase(),
    attrs: [],
    children: true,
    defaultAttrs: {},
    preRender () {},
    render () { return false },
    postRender () {}
  })

  element.defaultAttrs.class = element.defaultAttrs.class || ''

  return element
}
