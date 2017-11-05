import postcss, { plugin } from 'postcss'
import safeParser from 'postcss-safe-parser'
import { parse as parseSelector, stringify as stringfySelector } from 'css-selector-tokenizer'
import { unique as toClass } from 'shorthash'
import { first, last } from 'lodash'

function stringifySelectorNodes(nodes) {
  return stringfySelector({ type: 'selector', nodes })
}

const complexRelationships = ['>', '~', '+']
const staticPseudoSelectors = [
  'first-child',
  'last-child',
  'first-of-type',
  'last-of-type',
  'nth-child',
  'nth-last-child',
  'nth-of-type',
  'nth-last-of-type',
  'empty'
  // not ":not()" because it can contain a dynamicPseudoSelector
]
const dynamicPseudoSelectors = [
  'hover',
  'active',
  'focus',
  'link',
  'visited',
  'target',
  'checked',
  'in-range',
  'out-of-range',
  'invalid',
  'scope'
]

const pseudoElements = [
  'after',
  'before',
  'first-letter',
  'first-line',
  'selection',
  'backdrop',
  'placeholder',
  'marker',
  'spelling-error',
  'grammar-error'
]

/**
 * This converts all complex selectors into classes via shorthash and applies them
 * to the elements that should be selected as to allow for the most cross client support
 * @param  {Cheerio} $
 * @param  {Array} elements
 */
function safeSelectorize($, elements) {
  $.findNodes('style').forEach(($node) => {
    const css = replaceComplexSelectors($, $node.html())

    $node.html(css)
  })
}

function replaceComplexSelectors($, contents) {
  const { css } = postcss([
    plugin('postcss-safe-selectorize', () => (root) => {
      root.walkRules((rule) => {

        rule.selectors = rule.selectors.map((selector) => {
          if (isComplexSelector(selector)) {
            const classesMap = generateClassesForSelector(selector)

            for (const [ className, selectorPart ] of classesMap) {
              $(selectorPart).addClass(className)
            }

            return generateReplacementSelector(selector)
          }

          return selector
        })

      })
    })
  ]).process(contents, { parser: safeParser })

  return css
}


/**
 * checks if the given selector contains any parts that have less then ideal support
 * @param  {String]}  selector
 * @return {Boolean}  isComplex
 */
function isComplexSelector(selector) {
  const { nodes } = first(parseSelector(selector).nodes)

  return nodes.filter(({ type, operator, name }) => {
    /** complex relationships */
    if (type === 'operator' && complexRelationships.includes(operator)) return true

    /** attribute selector */
    if (type === 'attribute') return true

    /** static pseudo selectors */
    if (type.startsWith('pseudo') && staticPseudoSelectors.includes(name)) return true

    /** universal selector */
    if (type === 'universal') return true

    return false
  }).length > 0
}

/**
 * builds a map of selectors to be replaced with the corresponding class
 * @param  {String} selector
 * @return {Map}    selectorAndClassMap
 */
function generateClassesForSelector(selector) {
  const { nodes } = first(parseSelector(selector).nodes)
  const map = new Map()
  let selectorPartNodes = []

  /**
   * 1. gather all the nodes until a pseudo element or dynamic pseudo selector
   * 2. create a class for the selector part and add selector part/class to the map
   */
  nodes.forEach((node, index) => {
    /** we have a matched pseudo - drop the node, build the previous nodes to a string, and add it to the map entry */
    if (node.type.startsWith('pseudo') && (pseudoElements.includes(node.name) || dynamicPseudoSelectors.includes(node.name))) {
      const selectorPart = stringifySelectorNodes(selectorPartNodes)
      map.set(toClass(selectorPart), selectorPart)

      /**
       * keep the previous last node on so that the selector continues to work
       * .i.e. a:hover > b will become these selectors ['a', 'a > b']
       */
      selectorPartNodes = selectorPartNodes.length > 0 ? [ last(selectorPartNodes) ] : []
    }
    /** we are on the last element, push it on, and add the  */
    else if (index === nodes.length - 1) {
      selectorPartNodes.push(node)
      const selectorPart = stringifySelectorNodes(selectorPartNodes)
      map.set(toClass(selectorPart), selectorPart)
    }
    /** push the node to the current selector part */
    else {
      selectorPartNodes.push(node)
    }
  })

  return map
}

/**
 * generate a selector that uses the same classes as what was generated in generateClassesForSelector, but leaves in all the pseudo pieces
 * @param  {String} selector
 * @return {Map}    selectorAndClassMap
 */
function generateReplacementSelector(selector) {
  const { nodes } = first(parseSelector(selector).nodes)
  const map = new Map()
  let selectorPartNodes = []
  let replacementSelector = ''

  /**
   * 1. gather all the nodes until a pseudo element or dynamic pseudo selector
   * 2. create a class for the selector part and add selector part/class to the map
   */
  nodes.forEach((node, index) => {
    /** we have a matched pseudo - build the previous nodes to a string, and add it to the replacement selector, append the pseudo */
    if (node.type.startsWith('pseudo') && (pseudoElements.includes(node.name) || dynamicPseudoSelectors.includes(node.name))) {
      const selectorPart = stringifySelectorNodes(selectorPartNodes)
      replacementSelector += `.${toClass(selectorPart)}${stringifySelectorNodes([node])} `

      /**
       * keep the previous last node on so that the selector continues to work
       * .i.e. a:hover > b will become these selectors ['a', 'a > b']
       */
      selectorPartNodes = selectorPartNodes.length > 0 ? [ last(selectorPartNodes) ] : []
    }
    /** we are on the last element, push it on, and add the class */
    else if (index === nodes.length - 1) {
      selectorPartNodes.push(node)
      const selectorPart = stringifySelectorNodes(selectorPartNodes)
      replacementSelector += `.${toClass(selectorPart)} `
    }
    /** push the node to the current selector part */
    else {
      selectorPartNodes.push(node)
    }
  })

  return replacementSelector
}

export default safeSelectorize
