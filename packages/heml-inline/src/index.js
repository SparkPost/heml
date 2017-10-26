import juice from 'juice'
import inlineMargins from './inlineMargins'
import fixWidthsFor from './fixWidthsFor'
import removeProcessingIds from './removeProcessingIds'
import preferMaxWidth from './preferMaxWidth'

function inline ($, options = {}) {
  const { juice: juiceOptions = {} } = options

  juice.juiceDocument($, {
    ...juiceOptions
  })

  inlineMargins($)
  preferMaxWidth($, '[class$="__ie"]')
  fixWidthsFor($, 'img, .block__table__ie, .column')
  removeProcessingIds($)

  return $
}

export default inline
