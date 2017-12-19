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

export default createElement('container', {
  containsText: true,

  rules: {
    root: [ { display: trueHide('block') }, margin, width ],
    table__ie: [ 'width', 'max-width', { [margin]: ieAlignFallback } ],
    table: [ table ],
    row: [],
    cell: [ height, background, box, padding, border, borderRadius ]
  },

  css (Style) {
    return <Style>{`
      container {
        max-width: 600px;
        width: 100%;
        margin: auto;
      }
    `}</Style>
  },

  render (attrs, contents) {
    const { rules, ...defaultAttrs } = attrs

    return (
      <div {...defaultAttrs} {...rules.root}>
        {condition('mso | IE', `<table class="${rules.table__ie.className.join((' '))}" role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td>`)}
        <table {...rules.table} role='presentation' border='0' align='center' cellpadding='0' cellspacing='0' width='100%'>
          <tr {...rules.row}>
            <td {...cell} width='100%' align='left' valign='top'>{contents}</td>
          </tr>
        </table>
        {condition('mso | IE', `</td></tr></table>`)}
      </div>
    )
  }
})
