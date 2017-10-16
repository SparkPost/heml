import { defaults, isFunction } from 'lodash'

export default function (name, element) {
  if (isFunction(element)) {
    element = { render: element }
  }

  element = defaults({}, element, {
    tagName: name,
    children: [],
    defaultAttrs: {},
    preRender () {},
    render () { return false },
    postRender () {}
  })

  element.defaultAttrs.class = element.defaultAttrs.class || ''

  return element
}
