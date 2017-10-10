'use strict'

import { isPlainObject, escapeRegExp, isString, compact } from 'lodash'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'

const simpleSelectorParser = selectorParser()

/**
 * elements var looks like this
 *
 * {
 *   button: {
 *     '.button': [ { '@pseudo': 'root' }, { '@default': true }, 'background-color' ],
 *     '.text': [ { '@pseudo': 'text' }, { color: function() { tranform here } } ],
 *   },
 *   ...
 * }
 */

/**
 * Convert CSS to match custom elements
 * @param  {Object} options.elements An object of elements that define how to
 *                                   split up the css for each element
 * @param  {[type]} options.$        A cheerio instance
 */
export default postcss.plugin('postcss-element-expander', ({ elements, $ }) => {
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
  elements = coerceElements(elements)

  return (root, result) => {
    for (let element of elements) {
      /**
       * add the element tag to any css selectors that implicitly target an element
       * .i.e. #my-button that selects <button id="my-button">click me</button>
       */
      // attachTagsToElementSelectors(element, $)

      /**
       * There are 3 (non-mutually exclusive) possibilities when it contains the element tag
       *
       * 1. it directly targets the element - i.e. button { background: blue; }
       *    in this case we need generate entirely new rules, prepend before the original rule, and strip the used selectors
       *
       * 2. it uses an element tag as an ancestor/sibling - .i.e. button span { color: black; }
       *
       * 3. it uses an element pseudo element - .i.e. button::text { color: blue }
       */
      root.walkRules(new RegExp(element.tag, 'i'), (rule) => {
        /** CASE 1 */
        /** grab all the selectors that target this element */
        const elementSelectors = findDirectElementSelectors(element, rule.selector)

        /** Create new rules to properly target the elements */
        const expandedRules = expandElementRule(element, elementSelectors, rule)
        // expandedRules.forEach((elementRule) => rule.before(elementRule))

        /** remove the directly targeting selectors from the original rule */
        // rule.selectors = rule.selectors.rules((selector) => !elementSelectors.includes(selector))

        /** remove the rule if has no more selectors */
        // if (rule.selector.trim() === '') return rule.remove()

        /** CASE 2 */
        /** Replace all mentions of the element pseudo elements */
        // rule.selector = replaceElementPseudos(element, rule.selector)

        /** CASE 3 */
        /** Replace all mentions of the element tag */
        // rule.selector = replaceElementTags(element, rule.selector)
      })
    }
  }
})

/**
 * finds the given pseudo selector value from
 * @param  {[type]} decls [description]
 * @param  {[type]} prop  [description]
 * @return {[type]}       [description]
 */
function findPseudoDecl (decls, prop) {
  const foundDecls = decls.filter((decl) => {
    return (isPlainObject(decl) &&
          Object.keys(decl)[0] === `@${prop}`) || decl === `@${prop}`
  })

  if (foundDecls.length === 0) { return }

  const decl = foundDecls[0]

  if (isPlainObject(decl) && Object.keys(decl).length === 0) { return }

  return isPlainObject(decl) ? Object.values(decl)[0] : decl
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

/**
 * coerce the elements for use in the plugin
 * @param  {Object} elements the given elements
 * @return {Array}  elements in a more usable format
 */
function coerceElements (originalElements) {
  let elements = []

  for (const [ tag, originalRules ] of Object.entries(originalElements)) {
    let defaults = []
    let pseudos = {}
    let rules = {}

    for (const [ selector, decls ] of Object.entries(originalRules)) {
      /** gather all the default values */
      if (findPseudoDecl(decls, 'default')) defaults.push(selector)

      /** gather all the pseudo selectors */
      let pseudo = findPseudoDecl(decls, 'pseudo')
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
 * find all selectors that target the give element
 * @param  {Object} element  the element definition
 * @param  {String} selector the selector
 * @return {Array}           the matched selectors
 */
function findDirectElementSelectors (element, selector) {
  const selectors = simpleSelectorParser.process(selector).res

  return selectors.filter((selector) => {
    let selectorNodes = selector.nodes.reverse()

    for (const node of selectorNodes) {
      if (node.type === 'cominator') { break }

      if (node.type === 'pseudo' && node.value in element.pseudos) { break }

      if (node.type === 'tag' && node.value === element.tag) {
        return true
      }
    }

    return false
  }).map((selector) => String(selector).trim())
}
