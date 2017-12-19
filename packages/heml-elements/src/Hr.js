import HEML, { createElement, transforms, cssGroups, condition } from '@heml/utils' // eslint-disable-line no-unused-vars

const {
  trueHide,
  ieAlignFallback } = transforms

const {
  background,
  margin,
  padding,
  border,
  borderRadius,
  width,
  height,
  table,
  box } = cssGroups

export default createElement('hr', {
  children: false,

  rules: {
    root: [ { display: trueHide() }, margin, width ],
    table__ie: [ 'width', 'max-width', { [margin]: ieAlignFallback } ],
    table: [ table ],
    row: [ ],
    cell: [ height, background, box, padding, border, borderRadius, 'vertical-align' ]
  },

  css (Style) {
    return <Style>{`
      hr {
        width: 100%;
        margin: auto;
        border-top: 1px solid #9A9A9A;
      }
    `}</Style>
  },


  render (attrs, contents) {
    const { rules, ...defaultAttrs } = attrs

    return (
      <div {...defaultAttrs} {...rules.root}>
        {condition('mso | IE', `<table class="${rules.table__ie.className.join((' '))}" role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td>`)}
        <table {...rules.table} role='presentation' border='0' align='center' cellpadding='0' cellspacing='0' width='100%' style='table-layout: fixed;'>
          <tr {...rules.row}>
            <td {...rules.cell} width='100%' align='left' valign='top'>{`&nbsp;`}</td>
          </tr>
        </table>
        {condition('mso | IE', `</td></tr></table>`)}
      </div>
    )
  }
})
