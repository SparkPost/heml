import HEML, { createMetaElement } from '@heml/utils' // eslint-disable-line no-unused-vars
import hemlstyles from '@heml/styles'
import escape from 'escape-string-regexp'
import { castArray, isEqual, uniqWith, compact } from 'lodash'

const COMMENT_EMBED_CSS = `/*!***EMBED_CSS*****/`
const COMMENT_INLINE_CSS = `/*!***INLINE_CSS*****/`
const COMMENT_REGEX = new RegExp(`(${escape(COMMENT_EMBED_CSS)}|${escape(COMMENT_INLINE_CSS)})`)

export default createMetaElement('style', {
  parent: [ 'head' ],
  attrs: [ 'heml-embed' ],
  defaultAttrs: { 'heml-embed': false },

  async preRender (globals) {
    const { $ } = globals
    const options = buildOptions(globals)
    const $nodes = $.findNodes('style')
    const styles = nodesToStyles($nodes)

    const { css: processedCss } = await hemlstyles(stylesToCss(styles), options)
    const processedStyles = cssToStyles(processedCss)

    $nodes.forEach(($node) => $node.remove())
    $('head').append(stylesToTags(processedStyles))
  },

  render (attrs, contents) {
    return true
  }
})


/**
 * Generates the options object to be passed to hemlstyles
 * @param  {Cheerio} $        A cheerio instance
 * @param  {Array}   elements an array of HEML elements
 * @return {Object}           options for hemlstyles
 */
function buildOptions ({ $, elements }) {
  const options = {
    plugins: [],
    elements: {},
    aliases: {}
  }

  for (let element of elements) {
    if (element.postcss) {
      options.plugins = [ options.plugins, ...castArray(element.postcss) ]
    }

    if (element.rules) {
      options.elements[element.tagName] = element.rules
    }

    options.aliases[element.tagName] = $.findNodes(element.tagName)
  }

  return options
}

/**
 * Converts an array of $nodes into style objects
 * scope = { embed: Boolean, css: String }
 * @param  {Array[Cheerio]} $nodes
 * @return {Array[Object]}
 */
function nodesToStyles($nodes) {
  return $nodes.map(($node) => {
    return { css: $node.html(), embed: $node.is('[heml-embed]') }
  })
}

/**
 * Converts an array of style objects into a single string to be processed by hemlstyles
 * @param  {Array[Object]} styles
 * @return {String}
 */
function stylesToCss(styles) {
  styles = uniqWith(styles, isEqual)

  return styles.reduce((fullCss, { embed, css }) => fullCss += embed ?
    `${COMMENT_EMBED_CSS}${css}` : `${COMMENT_INLINE_CSS}${css}`, '')
}

/**
 * Converts a css string into  array of style objects
 * @param  {String}          css
 * @return {Array[Object]}   styles
 */
function cssToStyles(css) {
  const parts = compact(css.split(COMMENT_REGEX))

  return parts.reduce((styles, value) => {
    if (value === COMMENT_EMBED_CSS) {
      return [ ...styles, { embed: true, css: '' } ]
    } else if (value === COMMENT_INLINE_CSS) {
      return [ ...styles, { embed: false, css: '' } ]
    } else {
      styles[styles.length - 1].css += value

      return styles
    }
  }, []).filter((style) => style.css.length > 0)
}

/**
 * Convert style objects into html tags
 * @param  {Array[Object]} styles
 * @return {Array[String]}
 */
function stylesToTags(styles) {
  return styles.map(({ embed, css }) => {
    return `<style ${embed ? 'data-embed' : ''}>${css}</style>\n`
  })
}
