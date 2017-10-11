import { isPlainObject, escapeRegExp, isString, compact } from 'lodash'

/**
   * remap the elements var to looks like this
   * [
   *   {
   *     tag: 'button',
   *     pseudos: { root: '.button', text: '.text' },
   *     defaults: [ '.button' ],
   *     rules: {
   *       '.button': [ { prop: /^background-color$/, tranform: () => {} } ],
   *       '.text': [ { prop: /^color$/, transform: function() { tranform here } } ],
   *     }
   *   }
   *   ...
   * ]
   */

/**
 * coerce the elements for use in the plugin
 * @param  {Object} elements the given elements
 * @return {Array}  elements in a more usable format
 */
export default function (originalElements) {
  let elements = []

  for (const [ tag, originalRules ] of Object.entries(originalElements)) {
    let defaults = []
    let pseudos = {}
    let rules = {}

    for (const [ selector, decls ] of Object.entries(originalRules)) {
      /** gather all the default values */
      if (findAtDecl(decls, 'default')) defaults.push(selector)

      /** gather all the pseudo selectors */
      let pseudo = findAtDecl(decls, 'pseudo')
      if (pseudo) pseudos[pseudo] = selector

      /** remap the rules to always be { prop: RegExp, transform: Function } */
      rules[selector] = compact(decls.map((decl) => {
        if (isPlainObject(decl) && Object.keys(decl).length === 0) return

        const prop = isPlainObject(decl) ? Object.keys(decl)[0] : decl
        const transform = isPlainObject(decl) ? Object.values(decl)[0] : () => {}

        if (isString(prop) && prop.startsWith('@')) return

        return { prop: toRegExp(prop), transform }
      }))
    }

    elements.push({ tag, defaults, pseudos, rules })
  }

  return elements
}

/**
 * finds the given at declaration value
 * @param  {Array[Object]} decls the decls from an element
 * @param  {String}        the prop
 * @return {Any}           the found value
 */
function findAtDecl (decls, prop) {
  const foundDecls = decls.filter((decl) => {
    return (isPlainObject(decl) &&
          Object.keys(decl).length > 0 &&
          Object.keys(decl)[0] === `@${prop}`) || decl === `@${prop}`
  })

  if (foundDecls.length === 0) { return }

  const decl = foundDecls[0]

  return isPlainObject(decl) ? Object.values(decl)[0] : true
}

/**
 * convert the given string to a regular expression
 * @param  {String|RegExp} prop  the string to convert
 * @return {RegExp}              the regular expression
 */
function toRegExp (string) {
  if (isString(string) && string.startsWith('/') && string.lastIndexOf('/') !== 0) {
    const pattern = string.substr(1, string.lastIndexOf('/') - 1)
    const opts = string.substr(string.lastIndexOf('/') + 1).toLowerCase()

    return new RegExp(pattern, opts.includes('i') ? opts : `${opts}i`)
  }

  if (isString(string)) {
    return new RegExp(`^${escapeRegExp(string)}$`, 'i')
  }

  return string
}
