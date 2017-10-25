import juice from 'juice'
import inlineMargins from './inlineMargins'
import fixImageWidths from './fixImageWidths'
import removeProcessingIds from './removeProcessingIds'

function inline ($, options = {}) {
  const { juice: juiceOptions = {} } = options

  juice.juiceDocument($, {
    ...juiceOptions
  })

  inlineMargins($)
  fixImageWidths($)
  removeProcessingIds($)

  return $
}

export default inline
