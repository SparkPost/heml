import juice from 'juice'
import inlineMargins from './inlineMargins'
import fixImageWidths from './fixImageWidths'

function inline ($, styles = '', options = {}) {
  const { juice: juiceOptions } = options

  juice.inlineDocument($, styles, {
    inlinePseudoElements: true,
    ...juiceOptions
  })

  inlineMargins($)
  fixImageWidths($)

  return $
}

export default inline
