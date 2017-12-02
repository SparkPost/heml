import HEML, { createElement, createMetaElement } from '@heml/utils' // eslint-disable-line no-unused-vars
import hemlstyles from '@heml/styles'
import escape from 'escape-string-regexp'
import { castArray, isEqual, uniqWith, compact, flatMap } from 'lodash'

const COMMENT_EMBED_CSS = `/*!***EMBED_CSS*****/`
const COMMENT_INLINE_CSS = `/*!***INLINE_CSS*****/`
const COMMENT_IGNORE = `/*!***IGNORE_CSS*****/`
const IGNORE_REGEX = new RegExp(`(${escape(COMMENT_IGNORE)})`)
const COMMENT_REGEX = new RegExp(`(${escape(COMMENT_EMBED_CSS)}|${escape(COMMENT_INLINE_CSS)})`)

export default createMetaElement('style', {
  parent: [ 'head' ],
  attrs: [ 'heml-embed' ],
  defaultAttrs: { 'heml-embed': false },

  async preRender (globals) {
    const { $ } = globals
    const options = buildOptions(globals)
    const elementStyles = gatherElementStyles(globals)
    const ignoredElementStyles = elementStyles.filter(({ ignore }) => ignore)
    /** user given style[heml-ignore] are ignored through the findNodes query */
    const $nodes = $.findNodes('style')
    const styles = nodesToStyles($nodes)

    const { css: processedCss } = await hemlstyles(stylesToCss([ ...elementStyles, ...styles ]), options)
    const fullCss = insertIgnoredStyles(processedCss, ignoredElementStyles)
    const processedStyles = cssToStyles(fullCss)

    $nodes.forEach(($node) => $node.remove())
    $('head').append(stylesToTags(processedStyles))
  },

  render (attrs, contents) {
    return true
  }
})

/**
 * Generates the options object to be passed to hemlstyles
 * @param  {Object} globals
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
 * Gather all the style objects from the elements
 * @param  {Object}        globals
 * @return {Array[Object]}         an Array of style objects
 */
function gatherElementStyles ({ elements }) {
  return compact(flatMap(elements, (element) => {
    if (!element.css) { return }

    return castArray(element.css(StyleObjectElement)).map(JSON.parse)
  }))
}

const StyleObjectElement = createElement('style-object', (attrs, contents) => {
  return JSON.stringify({
    embed: !!attrs['heml-embed'],
    ignore: !!attrs['heml-ignore'],
    css: contents
  })
})

/**
 * Converts an array of $nodes into style objects
 * scope = { embed: Boolean, css: String }
 * @param  {Array[Cheerio]} $nodes
 * @return {Array[Object]}
 */
function nodesToStyles ($nodes) {
  return $nodes.map(($node) => {
    return { css: $node.html(), embed: $node.is('[heml-embed]') }
  })
}

/**
 * Converts an array of style objects into a single string to be processed by hemlstyles
 * @param  {Array[Object]} styles
 * @return {String}
 */
function stylesToCss (styles) {
  styles = uniqWith(styles, isEqual)

  let lastEmbed
  let fullCss = ''
  for (let { embed, ignore, css } of styles) {
    if (lastEmbed !== embed) {
      lastEmbed = embed
      fullCss += embed ? COMMENT_EMBED_CSS : COMMENT_INLINE_CSS
    }

    if (ignore) {
      fullCss += COMMENT_IGNORE
      continue
    }

    fullCss += css
  }

  return fullCss
}

/**
 * Inserts the CSS from the ignored styles into the CSS
 * @param  {String}        css           the css
 * @param  {Array[Object]} ignoredStyles an array of ignored styles
 * @return {String}                      the full CSS
 */
function insertIgnoredStyles (css, ignoredStyles) {
  for (const { css: ignoredCss } of ignoredStyles) {
    css = css.replace(IGNORE_REGEX, ignoredCss)
  }

  return css
}

/**
 * Converts a css string into  array of style objects
 * @param  {String}        css    a string of CSS
 * @return {Array[Object]}        styles
 */
function cssToStyles (css) {
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
function stylesToTags (styles) {
  return styles.map(({ embed, css }) => {
    return `<style ${embed ? 'data-embed' : ''}>${css}</style>\n`
  })
}
