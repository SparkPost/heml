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

condition.replace = function (html) {
  for (let [search, replace] of Object.entries(parts)) {
    html = html.replace(new RegExp(search, 'g'), replace)
  }

  return html
}

export default condition
