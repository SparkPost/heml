'use strict'

const _ = require('lodash')

const parts = {
  'START_CONDITION': '<!--[if ',
  'END_CONDITION': ']>',
  'END_COMMENT_CONDITIONAL': '<![endif]-->'
}

function condition (condition, content) {
  return `
  START_CONDITION${condition}END_CONDITION
    ${content.trim()}
  END_COMMENT_CONDITIONAL
  `
}

function replace (html) {
  _.each(parts, (replace, search) => {
    html = html.replace(new RegExp(search, 'g'), replace)
  })

  return html
};

export default condition
export { replace }
