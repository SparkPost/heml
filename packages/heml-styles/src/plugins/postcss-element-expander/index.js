'use strict'

import postcss from 'postcss'
import coerceElements from './coerceElements'
import tagAliasSelectors from './tagAliasSelectors'
import findDirectElementSelectors from './findDirectElementSelectors'
import { replaceElementTagMentions, replaceElementPseudoMentions, expandElementRule } from './expanders'

/**
 * elements var looks like this before being coerced
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
 * aliases var looks like this
 *
 * {
 *   button: [ $node, $node, $node, ... ]
 *   ...
 * }
 */

/**
 * Convert CSS to match custom elements
 * @param  {Object} options.elements An object of elements that define how to
 *                                   split up the css for each element
 * @param  {[type]} options.$        A cheerio instance
 */
export default postcss.plugin('postcss-element-expander', ({ elements, aliases }) => {
  elements = coerceElements(elements)

  return (root, result) => {
    for (let element of elements) {
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
