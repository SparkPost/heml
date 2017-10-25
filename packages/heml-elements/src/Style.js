import HEML, { createElement } from '@heml/utils' // eslint-disable-line no-unused-vars
import hemlstyles from '@heml/styles'
import { castArray, isEqual, uniqWith, sortBy } from 'lodash'

const START_EMBED_CSS = `/*!***START:EMBED_CSS*****/`
const START_INLINE_CSS = `/*!***START:INLINE_CSS*****/`

let styleMap
let options

export default createElement('style', {
  parent: [ 'head' ],
  attrs: [ 'for', 'heml-embed' ],
  defaultAttrs: {
    'heml-embed': false,
    'for': 'global'
  },

  preRender ({ $, elements }) {
    styleMap = new Map([ [ 'global', [] ] ])
    options = {
      plugins: [],
      elements: {},
      aliases: {}
    }

    for (let element of elements) {
      if (element.postcss) {
        options.plugins = options.plugins.concat(castArray(element.postcss))
      }

      if (element.rules) {
        options.elements[element.tagName] = element.rules
      }

      options.aliases[element.tagName] = $.findNodes(element.tagName)
    }
  },

  render (attrs, contents) {
    if (!styleMap.get(attrs.for)) {
      styleMap.set(attrs.for, [])
    }

    styleMap.get(attrs.for).push({
      embed: !!attrs['heml-embed'],
      ignore: !!attrs['heml-ignore'],
      css: contents
    })

    return false
  },

  async flush () {
    /**
     * reverse the styles so they fall in an order that mirrors their position
     * - they get rendered bottom to top - should be styled top to bottom
     *
     * the global styles should always be rendered last
     */
    const globalStyles = styleMap.get('global')
    styleMap.delete('global')
    styleMap = new Map([...styleMap].reverse())
    styleMap.set('global', globalStyles)

    let ignoredCSS = []
    let fullCSS = ''

    /** combine the non-ignored css to be combined */
    for (let [ element, styles ] of styleMap) {
      styles = uniqWith(styles, isEqual)
      styles = element === 'global' ? styles : sortBy(styles, ['embed', 'css'])

      styles.forEach(({ ignore, embed, css }) => {
        /** replace the ignored css with placeholders that will be swapped later */
        if (ignore) {
          ignoredCSS.push({ embed, css })
          fullCSS += ignoreComment(ignoredCSS.length - 1)
        } else if (embed) {
          fullCSS += `${START_EMBED_CSS}${css}`
        } else {
          fullCSS += `${START_INLINE_CSS}${css}`
        }
      })
    }

    let { css: processedCss } = await hemlstyles(fullCSS, options)

    /** put the ignored css back in */
    ignoredCSS.forEach(({ embed, css }, index) => {
      processedCss = processedCss.replace(ignoreComment(index), embed ? `${START_EMBED_CSS}${css}` : `${START_INLINE_CSS}${css}`)
    })

    /** split on the dividers and map it so each part starts with INLINE or EMBED */
    let processedCssParts = processedCss.split(/\/\*!\*\*\*START:/g).splice(1).map((css) => css.replace(/_CSS\*\*\*\*\*\//, ''))

    /** build the html */
    let html = ''
    let lastType = null

    for (let cssPart of processedCssParts) {
      const css = cssPart.replace(/^(EMBED|INLINE)/, '')
      const type = cssPart.startsWith('EMBED') ? 'EMBED' : 'INLINE'

      if (type === lastType) {
        html += css
      } else {
        lastType = type
        html += `${html === '' ? '' : '</style>'}\n<style${type === 'EMBED' ? ' data-embed' : ''}>${css}\n`
      }
    }

    html += '</style>'

    /** reset the styles and options */
    styleMap = options = null

    return html
  }
})

function ignoreComment (index) {
  return `/*!***IGNORE_${index}*****/`
}
