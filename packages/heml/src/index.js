import parse from '@heml/parse'
import render from '@heml/render'
import inline from '@heml/inline'
import validate from '@heml/validate'
import { condition } from '@heml/utils'
import byteLength from 'byte-length'
import { html as beautify } from 'js-beautify'
import { toArray, flattenDeep } from 'lodash'
import * as coreElements from '@heml/elements'

/**
 * renders the given HEML string with the config provided
 * @param  {String} HEML     the heml to render
 * @param  {Object} options  the options
 * @return {Object}          { metadata, html, errors }
 */
async function heml (contents, options = {}) {
  const results = {}
  const {
    beautify: beautifyOptions = {},
    validate: validateOption = 'soft'
  } = options

  options.elements = flattenDeep(toArray(coreElements).concat(options.elements || []))

  /** parse it ✂️ */
  const $heml = parse(contents, options)

  /** validate it 🕵 */
  const errors = validate($heml, options)
  if (validateOption.toLowerCase() === 'strict' && errors.length > 0) { throw errors[0] }
  if (validateOption.toLowerCase() === 'soft') { results.errors = errors }

  /** render it 🤖 */
  const {
    $: $html,
    metadata
  } = await render($heml, options)

  /** inline it ✍️ */
  inline($html, options)

  /** beautify it 💅 */
  results.html = condition.replace(beautify($html.html(), {
    indent_size: 2,
    indent_inner_html: true,
    preserve_newlines: false,
    extra_liners: [],
    ...beautifyOptions }))

  /** final touches 👌 */
  metadata.size = `${(byteLength(results.html) / 1024).toFixed(2)}kb`
  results.metadata = metadata

  /** send it back 🎉 */
  return results
}

/** module.exports for commonjs */
module.exports = heml
