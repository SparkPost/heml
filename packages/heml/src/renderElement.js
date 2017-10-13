import stringifyAttributes from 'stringify-attributes'
import { has, isObject, isFunction } from 'lodash'

export default async function (name, attrs = {}, contents) {
  const g = global || window

  if (has(g, name) && isObject(g[name]) && has(g[name], 'render') && isFunction(g[name].render)) {
    return g[name](attrs, contents)
  }

  if (contents === '' || [].includes(name)) {
    return `<${name} ${stringifyAttributes(attrs)} />`
  }

  return `<${name} ${stringifyAttributes(attrs)}>${contents}</${name}>`
}
