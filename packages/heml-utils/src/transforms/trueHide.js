'use strict'

import { isUndefined } from 'lodash'

export default (type, containsTables = false) => (decl, originalRule) => {
  if (decl.value.trim().toLowerCase() === 'none') {
    decl.after(decl.clone({ prop: 'mso-hide', value: 'all' }))
    decl.after(decl.clone({ prop: 'max-height', value: '0px' }))
    decl.after(decl.clone({ prop: 'overflow', value: 'hidden' }))

    if (type === 'block' || type === 'table' || containsTables) {
      const hideTableRule = decl.parent.clone()
      hideTableRule.selectors = hideTableRule.selectors.map((s) => `${s} table`)
      hideTableRule.removeAll()
      hideTableRule.append(decl.clone({ prop: 'mso-hide', value: 'all' }))
      originalRule.after(hideTableRule)
    }
  } else if (decl.value.trim().toLowerCase() === type || isUndefined(type)) {
    decl.after(decl.clone({ prop: 'mso-hide', value: 'none' }))
    decl.after(decl.clone({ prop: 'max-height', value: 'initial' }))
    decl.after(decl.clone({ prop: 'overflow', value: 'auto' }))

    if (type === 'block' || type === 'table' || containsTables) {
      const showTableRule = decl.parent.clone()
      showTableRule.selectors = showTableRule.selectors.map((s) => `${s} table`)
      showTableRule.removeAll()
      showTableRule.append(decl.clone({ prop: 'mso-hide', value: 'none' }))
      originalRule.after(showTableRule)
    }
  }
}
