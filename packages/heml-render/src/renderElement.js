import stringifyAttributes from 'stringify-attributes'
import isPromise from 'is-promise'
import { isString, isArray, defaults, mapValues, castArray } from 'lodash'
import selfClosingHtmlTags from 'html-tags/void'

export default function (name, attrs, contents) {
  if (!isString(name)) {
    attrs = defaults({}, attrs, name.defaultAttrs || {})
    attrs = mapValues(attrs, (value, name) => {
      if ((value === '' && name !== 'class') || value === 'true' || value === 'on') { return true }

      if (value === 'false' || value === 'off') { return false }

      return value
    })

    /** custom elements can return promises, arrays, strings */
    const renderResults = castArray(name.render(attrs, contents))

    /** we want to return synchronously if we can */
    if (!isPromise(renderResults) && renderResults.filter(isPromise).length === 0) { return renderResults.join('') }

    /** otherwise, combine the array of promises/strings into a single string */
    return Promise.resolve(name.render(attrs, contents))
      .then((results) => {
        if (isArray(results)) {
          return Promise.all(results).then((results) => {
            let str = ''

            results.forEach(function (part) {
              str += part
            })

            return str
          })
        }

        return results
      })
  }

  /** if we have a regular ol element go ahead and convert it to a string */
  if (selfClosingHtmlTags.includes(name)) {
    return `<${name}${attrs ? stringifyAttributes(attrs) : ''} />`
  }

  return `<${name}${attrs ? stringifyAttributes(attrs) : ''}>${contents || '&zwnj;'}</${name}>`
}
