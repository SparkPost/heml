import postcss, { plugin } from 'postcss'
import safeParser from 'postcss-safe-parser'
import { parse as parseSelector, stringify as stringfySelector } from 'css-selector-tokenizer'
import { get, first, last, intersection, uniq } from 'lodash'

function stringifySelectorNodes(nodes) {
  return stringfySelector({ type: 'selector', nodes })
}

const complexRelationships = ['>', '~', '+']
// not ":not()" because it can contain a dynamicPseudoSelector
const staticPseudoSelectors = [ 'first-child', 'last-child', 'first-of-type', 'last-of-type', 'nth-child', 'nth-last-child', 'nth-of-type', 'nth-last-of-type', 'empty' ]
const dynamicPseudoSelectors = [ 'hover', 'active', 'focus', 'link', 'visited', 'target', 'checked', 'in-range', 'out-of-range', 'invalid', 'scope' ]
const pseudoElements = [ 'after', 'before', 'first-letter', 'first-line', 'selection', 'backdrop', 'placeholder', 'marker', 'spelling-error', 'grammar-error' ]

/**
 * process all the style tags
 * @param  {Cheerio} $
 * @param  {Array}   elements
 */
function processStyles($, elements) {
  $.findNodes('style').forEach(($node) => {
    const css = processCSS($, elements, $node.html())

    $node.html(css)
  })
}

/**
 * process the given css
 * @param  {Cheerio} $
 * @param  {String}  contents some css
 * @return {String}           the modified css
 */
function processCSS($, elements, contents) {
  const { css } = postcss([
    safeSelectorize($),
    tagAllAliasSelectors($, elements),
  ]).process(contents, { parser: safeParser })

  return css
}

const tagAllAliasSelectors = plugin('postcss-tag-aliases', ($, elements) => (root) => {
  /**
   * add the element tag to any css selectors that implicitly target an element
   * .i.e. #my-button that selects <button id="my-button">click me</button>
   */
  const elementNames = elements.map(({ tagName }) => tagName)

  root.walkRules((rule) => {
    let newSelectors = []

    rule.selectors.forEach((selector) => {
      /** skip if we already target a tag (no need to alias) */
      if (targetsTag(selector)) return newSelectors.push(selector)

      const selectedTags = uniq($.findNodes(queryableSelector(selector)).map(($node) => $node[0].name))
      const targetSingleTag = selectedTags.length === 1
      const selectedElements = intersection(selectedTags, elementNames)
      const targetsNonElements = selectedTags.length > selectedElements.length

      /** skip if we are not targeting any elements (no need to alias) */
      if (selectedElements.length === 0) return newSelectors.push(selector)

      /** if we target only one tag/element, just drop the tag onto the selector */
      if (targetSingleTag) {
        const elementName = first(selectedElements)
        return newSelectors.push(appendElementSelector(elementName, selector))
      }

      /** if we target more than one tag/element, generate specific selector for each element */
      for (let elementName of selectedElements) {
        newSelectors.push(buildTheElementSpecificSelector(elementName, selector, $))
      }

      /** if we target non-elements, we need to keep the original selector on */
      if (targetsNonElements) return newSelectors.push(selector)
    })

    rule.selectors = newSelectors
  })
})


/**
 * Add the element tag to the end of the selector
 * @param  {Object} element  element definition
 * @param  {String} selector the selector
 * @return {String}          the modified selector
 */
function appendElementSelector (elementName, selector) {
  const nodes = first(parseSelector(selector).nodes).nodes

  // default to the last node in case there is no combinator
  let lastCombinatorIndex = nodes.length - 1
  nodes.forEach((node, i) => {
    if (node.type === 'operator' || node.type === 'spacing') {
      lastCombinatorIndex = i + 1
    }
  })

  nodes.splice(lastCombinatorIndex, 0, { name: elementName, type: 'element' })

  return stringifySelectorNodes(nodes)
}


function buildTheElementSpecificSelector(elementName, selector, $) {
  const nodes = first(parseSelector(selector).nodes).nodes.reverse()
  const $elementNodes = $.findNodes(queryableSelector(appendElementSelector(elementName, selector)))

  for (const node of nodes) {
    if (node.type === 'operator' || node.type === 'spacing') { break }

    if (node.type === 'class') {
      const newClass = `${node.name}-${elementName}`
      $elementNodes.forEach(($node) => $node.removeClass(node.name).addClass(newClass))
      node.name = newClass
    }

    if (node.type === 'id') {
      const newId = `${node.name}-${elementName}`
      $elementNodes.forEach(($node) => $node.attr('id', newId))
      node.name = newId
    }
  }

  return appendElementSelector(elementName, stringifySelectorNodes(nodes.reverse()))
}

function queryableSelector(selector) {
  const { nodes } = first(parseSelector(selector).nodes)

  /** remove all non-static pseudo selectors/elements */
  return stringifySelectorNodes(nodes.filter((node) => {
    return !(node.type.startsWith('pseudo') && !staticPseudoSelectors.includes(node.name))
  }))
}

/**
 * checks if selector targets a tag
 * @param  {String} selector the selector
 * @return {Boolean}         if the selector targets a tag
 */
function targetsTag (selector) {
  const nodes = first(parseSelector(selector).nodes).nodes.reverse()

  for (const node of nodes) {
    if (node.type === 'operator' || node.type === 'spacing') { return false }

    if (node.type === 'element') { return true }
  }
}






















/**
 * This converts all complex selectors into classes via shorthash and applies them
 * to the elements that should be selected as to allow for the most cross client support
 * @param  {Cheerio} $
 * @param  {Array} elements
 */
const safeSelectorize = plugin('postcss-safe-selectorize', ($) => (root) => {
  root.walkRules((rule) => {
    rule.selectors = rule.selectors.map((selector) => {
      if (isComplexSelector(selector)) {
        return convertToSafeSelector(selector, $)
      }

      return selector
    })
  })
})

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

function ()

/**
 * builds a map of selectors to be replaced with the corresponding class
 * @param  {String} selector
 * @return {Map}    selectorAndClassMap
 */
function convertToSafeSelector(selector, $) {
  const { nodes } = first(parseSelector(selector).nodes)
  const classes = new Map()


  nodes.forEach((node, index) => {
    if (type === 'operator' && complexRelationships.includes(operator)) {
      const prevPart = getPrevPart(nodes, index)
      const { id, classes, tags } = calculateSelectorStore(prevPart)
    }

    if (type === 'universal')
  })


  /**
   * 1. gather all the nodes until a pseudo element or dynamic pseudo selector
   * 2. create a class for the selector part and add selector part/class to the map
   */
  // nodes.forEach((node, index) => {
    /** we have a matched pseudo - drop the node, build the previous nodes to a string, and add it to the map entry */
    // if (node.type.startsWith('pseudo') && (pseudoElements.includes(node.name) || dynamicPseudoSelectors.includes(node.name))) {
    //   const selectorPart = stringifySelectorNodes(selectorPartNodes)
    //   map.set(toClass(selectorPart), selectorPart)

      /**
       * keep the previous last node on so that the selector continues to work
       * .i.e. a:hover > b will become these selectors ['a', 'a > b']
       */
      // selectorPartNodes = selectorPartNodes.length > 0 ? [ last(selectorPartNodes) ] : []
    // }
    /** we are on the last element, push it on, and add the  */
    // else if (index === nodes.length - 1) {
    //   selectorPartNodes.push(node)
    //   const selectorPart = stringifySelectorNodes(selectorPartNodes)
    //   map.set(toClass(selectorPart), selectorPart)
    // }
    /** push the node to the current selector part */
    // else {
    //   selectorPartNodes.push(node)
    // }
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

export default processStyles
