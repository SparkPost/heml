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
        expandedRules.forEach((expandedRule) => rule.before(expandedRule))

        /** remove the directly targeting selectors from the original rule */
        rule.selectors = rule.selectors.filter((selector) => !elementSelectors.includes(selector))

        /** remove the rule if has no selectors */
        if (rule.selector.trim() === '') return rule.remove()

        /** CASE 2 */
        /** Replace all mentions of the element pseudo elements */
        rule.selector = replaceElementPseudoMentions(element, rule.selector)

        /** CASE 3 */
        /** Replace all mentions of the element tag */
        rule.selector = replaceElementTagMentions(element, rule.selector)
      })
    }
  }
})

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
 * find all selectors that target the give element
 * @param  {Object} element  the element definition
 * @param  {String} selector the selector
 * @return {Array}           the matched selectors
 */
function findDirectElementSelectors (element, selector) {
  const selectors = simpleSelectorParser.process(selector).res

  return selectors.filter((selector) => {
    let selectorNodes = selector.nodes.concat([]).reverse() // clone the array

    for (const node of selectorNodes) {
      if (node.type === 'cominator') { break }

      if (node.type === 'pseudo' && node.value.replace(/::?/, '') in element.pseudos) {
        break
      }

      if (node.type === 'tag' && node.value === element.tag) { return true }
    }

    return false
  }).map((selector) => String(selector).trim())
}

/**
 * replace all custom element tag selectors
 * @param  {Object} element  the element definition
 * @param  {String} selector the selector
 * @return {String}          the replaced selector
 */
function replaceElementTagMentions (element, selector) {
  const processor = selectorParser((selectors) => {
    let nodesToReplace = []

    /**
     * looping breaks if we replace dynamically
     * so instead collect an array of nodes to swap and do it at the end
     */
    selectors.walk((node) => {
      if (node.value === element.tag && node.type === 'tag') { nodesToReplace.push(node) }
    })

    nodesToReplace.forEach((node) => node.replaceWith(element.pseudos.root))
  })

  return processor.process(selector).result
}

/**
 * replace all custom element pseudo selectors
 * @param  {Object} element  the element definiton
 * @param  {String} selector the selector
 * @return {String}          the replaced selector
 */
function replaceElementPseudoMentions (element, selector) {
  const processor = selectorParser((selectors) => {
    let nodesToReplace = []
    let onElementTag = false

    /**
     * looping breaks if we replace dynamically
     * so instead collect an array of nodes to swap and do it at the end
     */
    selectors.walk((node) => {
      if (node.type === 'tag' && node.value === element.tag) {
        onElementTag = true
      } else if (node.type === 'combinator') {
        onElementTag = false
      } else if (node.type === 'pseudo' && onElementTag) {
        const matchedPseudos = Object.entries(element.pseudos).filter(([ pseudo ]) => {
          return node.value.replace(/::?/, '') === pseudo
        })

        if (matchedPseudos.length > 0) {
          const [, value] = matchedPseudos[0]
          nodesToReplace.push({ node, value })
        }
      }
    })

    nodesToReplace.forEach(({ node, value }) => node.replaceWith(` ${value}`))
  })

  return processor.process(selector).result
}

/**
 * expand the given rule to correctly the style the element
 * @param {Object}       element      element The element definition
 * @param {Array}        selectors    the matched selectors to for
 * @return {Array[Rule]}              an array of the expanded rules
 */
function expandElementRule (element, selectors = [], originalRule) {
  /** early return if we don't have any selectors */
  if (selectors.length === 0) return []

  let usedProps = []
  let expandedRules = []
  let defaultRules = []

  /** create the base rule */
  const baseRule = originalRule.clone()
  baseRule.selectors = selectors
  baseRule.selector = replaceElementTagMentions(element, baseRule.selector)

  /** create postcss rules for each element rule */
  for (const [ ruleSelector, ruleDecls ] of Object.entries(element.rules)) {
    const isRoot = element.pseudos.root === ruleSelector
    const isDefault = element.defaults.includes(ruleSelector)
    const expandedRule = baseRule.clone()

    /** gather all rules that get decls be default */
    if (isDefault) { defaultRules.push(expandedRule) }

    /** map all the selectors to target this rule selector */
    if (!isRoot) { expandedRule.selectors = expandedRule.selectors.map((selector) => `${selector} ${ruleSelector}`) }

    /** strip any non whitelisted props, run tranforms, gather used props */
    expandedRule.walkDecls((decl) => {
      const matchedRuleDecls = ruleDecls.filter(({ prop }) => prop.test(decl.prop))

      if (matchedRuleDecls.length === 0) { return decl.remove() }

      usedProps.push(decl.prop)
      matchedRuleDecls.forEach(({ transform }) => transform(decl, originalRule))
    })

    expandedRules.push(expandedRule)
  }

  baseRule.walkDecls((decl) => {
    if (!usedProps.includes(decl.prop)) {
      defaultRules.forEach((defaultRule) => defaultRule.prepend(decl.clone()))
    }
  })

  return expandedRules
}
