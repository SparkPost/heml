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

export default createElement('block', {
  containsText: true,

  rules: {
    '.block': [ { '@pseudo': 'root' }, { display: trueHide('block') }, margin, width ],

    '.block__table__ie': [ 'width', 'max-width', { [margin]: ieAlignFallback } ],

    '.block__table': [ { '@pseudo': 'table' }, table ],

    '.block__row': [ { '@pseudo': 'row' } ],

    '.block__cell': [ { '@pseudo': 'cell' }, height, background, box, padding, border, borderRadius, 'vertical-align' ]
  },

  css (Style) {
    return <Style>{` block { width: 100%; } `}</Style>
  },

  render (attrs, contents) {
    attrs.class += ' block'
    return (
      <div {...attrs}>
        {condition('mso | IE', `<table class="block__table__ie" role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td>`)}
        <table class='block__table' role='presentation' border='0' align='center' cellpadding='0' cellspacing='0' width='100%'>
          <tr class='block__row'>
            <td class='block__cell' width='100%' align='left' valign='top'>{contents}</td>
          </tr>
        </table>
        {condition('mso | IE', `</td></tr></table>`)}
      </div>
    )
  }
})
