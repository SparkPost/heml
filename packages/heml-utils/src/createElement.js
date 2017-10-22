import { defaults, isFunction } from 'lodash'

export default function (name, element) {
  if (!name || name.trim().length === 0) {
    throw new Error(`When creating an element, you must set the name. ${name.trim().length === 0 ? 'An empty string' : `"${name}"`} was given.`)
  }

  if (isFunction(element)) {
    element = { render: element }
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
