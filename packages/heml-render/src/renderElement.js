import stringifyAttributes from 'stringify-attributes'
import isPromise from 'is-promise'
import { isPlainObject, defaults, mapValues, castArray, compact, flattenDeep } from 'lodash'
import selfClosingHtmlTags from 'html-tags/void'

export default function (name, attrs, ...contents) {
  /** catch all promises in this content and wait for them to finish */
  if (contents.filter(isPromise).length > 0) { return Promise.all(contents).then((contents) => render(name, attrs, contents.join(''))) }

  return render(name, attrs, contents.join(''))
}

function render (name, attrs, contents) {
  if (!name || (isPlainObject(name) && !name.render)) {
    throw new Error(`name must be a HEML element or HTML tag name (.e.g 'td'). Received: ${JSON.stringify(name)}`)
  }

  if (isPlainObject(name) && name.render) {
    /** set the defaults and massage attribute values */
    attrs = defaults({}, attrs, name.defaultAttrs || {})
    attrs = mapValues(attrs, (value, name) => {
      if ((value === '' && name !== 'class') || value === 'true' || value === 'on') { return true }

      if (value === 'false' || value === 'off') { return false }

      return value
    })

    /**
     * custom elements can return promises, arrays, or strings
     *
     * we will:
     * 1. check for the shorthands and render on that
     * 2. return a string synchronously if we can
     * 3. return a string in a promise
     */
    const renderResults = castArray(name.render(attrs, contents))

    /** 1. catch shorthands for rerendering the element */
    if (renderResults.length === 1 && renderResults[0] === true) {
      return render(name.tagName, attrs, contents)
    }

    /** 2. we want to return synchronously if we can */
    if (renderResults.filter(isPromise).length === 0) {
      return compact(renderResults).join('')
    }

    /** otherwise, combine the array of promises/strings into a single string */
    return Promise.all(renderResults).then((results) => {
      return compact(flattenDeep(results)).join('')
    })
  }

  /** if we have a regular ol element go ahead and convert it to a string */
  if (attrs && attrs.class === '') { delete attrs.class }
  if (attrs && attrs.class) { attrs.class = attrs.class.trim() }

  if (selfClosingHtmlTags.includes(name)) {
    return `<${name}${attrs ? stringifyAttributes(attrs) : ''} />`
  }

  return `<${name}${attrs ? stringifyAttributes(attrs) : ''}>${contents || ' '}</${name}>`
}
