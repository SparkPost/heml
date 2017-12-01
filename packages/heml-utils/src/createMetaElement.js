import { isFunction } from 'lodash'
import createElement from './createElement'

export default function (name, element) {
  if (!name || name.trim().length === 0) {
    throw new Error(`When creating an element, you must set the name. ${name.trim().length === 0 ? 'An empty string' : `"${name}"`} was given.`)
  }

  if (isFunction(element)) {
    element = { render: element }
  }

  element.meta = true

  return createElement(name, element)
}
