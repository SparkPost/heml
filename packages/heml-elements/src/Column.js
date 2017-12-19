import HEML, { createElement, transforms, cssGroups } from '@heml/utils' // eslint-disable-line no-unused-vars
import { times } from 'lodash'

const {
  background,
  box,
  padding,
  border,
  borderRadius } = cssGroups

const breakpoint = 600

export default createElement('column', {
  attrs: [ 'small', 'large' ],
  parent: [ 'row' ],
  defaultAttrs: { small: 12, large: 12 },
  containsText: true,

  rules: {
    root: [ { display: transforms.trueHide(undefined, true) }, background, box, padding, border, borderRadius, 'vertical-align' ]
  },

  css (Style) {
    return <Style heml-embed>{`
       @media only screen and (max-width: ${breakpoint}px) {
        .column, .column-filler { float: left; box-sizing: border-box; }
        ${times(12, (i) => `
        .col-sm-${i+1} {
          width: ${Math.round((100 * (i+1)) / 12)}% !important;
          display: block;
        }
        `)}
      }
    `}</Style>
  },

  render (attrs, contents) {
    const { small, large, rules, ...defaultAttrs } = attrs
    const largeWidth = `${Math.round((100 * parseInt(large, 10)) / 12)}%`

    return (
      <td {...defaultAttrs} {...rules.root} class={`column col-sm-${parseInt(small, 10)}`} width={largeWidth} style={`width: ${largeWidth};`} align='left' valign='top'>
        {contents.length === 0 ? '&nbsp;' : contents}
      </td>)
  }
})
