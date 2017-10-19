import parse from '@heml/parse'
import render from '@heml/render'
import inline from '@heml/inline'
import validate from '@heml/validate'
import byteLength from 'byte-length'
import { html as beautify } from 'js-beautify'
import { toArray, flattenDeep } from 'lodash'
import * as coreElements from '@heml/elements'
import { replace as conditionalReplace } from './utils/condition'

async function heml (contents, options = {}) {
  const results = {}
  const {
    beautifier: beautifyOptions = {},
    validate: validateOption = 'soft'
  } = options

  options.elements = flattenDeep(toArray(coreElements).concat(options.elements || []))

  /** parse it 🗡 */
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

  /** inline it  */
  inline($html, options)

  /** beautify it 💅 */
  results.html = beautify(conditionalReplace($html.html()), {
    indent_size: 2,
    indent_inner_html: true,
    preserve_newlines: false,
    extra_liners: [],
    ...beautifyOptions })

  /** final touches 👌 */
  metadata.size = `${(byteLength(results.html) / 1024).toFixed(2)}kb`
  results.metadata = metadata

  /** send it back 🎉 */
  return results
}

export default heml
