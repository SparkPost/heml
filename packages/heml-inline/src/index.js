import _ from 'lodash'
import juice from 'juice'

function inline($, styles = '', options = {}) {
  const { juice: juiceOptions } = options

   juice.inlineDocument($dom, styles, {
    inlinePseudoElements: true,
    ...juiceOptions
   });
}

export default inline
