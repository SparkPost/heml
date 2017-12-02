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
    '.container': [ { '@pseudo': 'root' }, { display: trueHide('block') }, margin, width ],

    '.container__table__ie': [ 'width', 'max-width', { [margin]: ieAlignFallback } ],

    '.container__table': [ { '@pseudo': 'table' }, table ],

    '.container__row': [ { '@pseudo': 'row' } ],

    '.container__cell': [ { '@pseudo': 'cell' }, height, background, box, padding, border, borderRadius ]
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
    attrs.class += ' container'
    return (
      <div {...attrs}>
        {condition('mso | IE', `<table class="container__table__ie" role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td>`)}
        <table class='container__table' role='presentation' border='0' align='center' cellpadding='0' cellspacing='0' width='100%'>
          <tr class='container__row'>
            <td class='container__cell' width='100%' align='left' valign='top'>{contents}</td>
          </tr>
        </table>
        {condition('mso | IE', `</td></tr></table>`)}
      </div>
    )
  }
})
