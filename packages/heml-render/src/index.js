import { filter, keyBy, first } from 'lodash'
import renderElement from './renderElement'

export { renderElement }

/**
 * preRender, render, and postRender all elements
 * @param  {Array}   elements  List of element definitons
 * @param  {Object}  globals
 * @return {Promise}           Returns an object with the cheerio object and metadata
 */
export default async function render ($, options = {}) {
  const {
    elements = []
  } = options

  const globals = { $, elements, options }
  const Meta = first(elements.filter(({ tagName }) => tagName === 'meta'))

  await preRenderElements(elements, globals)
  await renderMetaElements(elements, globals)
  await renderElements(elements, globals)
  await postRenderElements(elements, globals)

  return { $, metadata: Meta ? Meta.flush() : {} }
}

/**
 * Run the async preRender functions for each element
 * @param  {Array}  elements  List of element definitons
 * @param  {Object} globals
 * @return {Promise}
 */
async function preRenderElements (elements, globals) {
  for (let element of elements) {
    await element.preRender(globals)
  }
}

/**
 * Run the async postRender functions for each element
 * @param  {Array}  elements  List of element definitons
 * @param  {Object} globals
 * @return {Promise}
 */
async function postRenderElements (elements, globals) {
  for (let element of elements) {
    await element.postRender(globals)
  }
}

/**
 * Renders meta HEML elements
 * @param  {Array}  elements  List of element definitons
 * @param  {Object} globals
 * @return {Promise}
 */
async function renderMetaElements (elements, globals) {
  const { $ } = globals
  const metaTagNames = filter(elements, ({ meta }) => !!meta).map(({ tagName }) => tagName)

  /** Render the meta elements first to last */
  const $nodes = $.findNodes(metaTagNames)
  await renderNodes($nodes, globals)
}

/**
 * Renders HEML elements
 * @param  {Array}  elements  List of element definitons
 * @param  {Object} globals
 * @return {Promise}
 */
async function renderElements (elements, globals) {
  const { $ } = globals
  const nonMetaTagNames = filter(elements, ({ meta }) => !meta).map(({ tagName }) => tagName)

  /** Render the elements last to first/outside to inside */
  const $nodes = $.findNodes(nonMetaTagNames).reverse()
  await renderNodes($nodes, globals)
}

/**
 * renders the given array of $nodes
 * @param  {Array[Cheerio]} $nodes
 * @param  {Object}         globals { $, elements }
 */
async function renderNodes ($nodes, globals) {
  const { elements } = globals
  const elementMap = keyBy(elements, 'tagName')

  for (let $node of $nodes) {
    const tagName = $node.prop('tagName').toLowerCase()

    if (!elementMap[tagName]) { continue }

    const element = elementMap[tagName]

    await renderNode($node, element)
  }
}

/**
 * renders a single $node of the given element
 * @param  {Cheerio} $node
 * @param  {Object}  element
 */
async function renderNode ($node, element) {
  const contents = $node.html()
  const attrs = $node[0].attribs

  const renderedValue = await Promise.resolve(renderElement(element, attrs, contents))

  $node.replaceWith(renderedValue.trim())
}
