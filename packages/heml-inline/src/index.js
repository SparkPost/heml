import juice from 'juice'
import inlineMargins from './inlineMargins'
import fixImageWidths from './fixImageWidths'

function inline ($, options = {}) {
  const { juice: juiceOptions = {} } = options

  juice.juiceDocument($, {
    ...juiceOptions
  })

  inlineMargins($)
  fixImageWidths($)

  return $
}

export default inline
