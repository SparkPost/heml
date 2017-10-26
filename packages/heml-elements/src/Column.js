import HEML, { createElement, transforms, cssGroups } from '@heml/utils' // eslint-disable-line no-unused-vars
import Style from './Style'

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
    '.column': [ { '@pseudo': 'root' }, { display: transforms.trueHide(undefined, true) }, background, box, padding, border, borderRadius, 'vertical-align' ]
  },

  render (attrs, contents) {
    const small = parseInt(attrs.small, 10)
    const large = parseInt(attrs.large, 10)
    const largeWidth = `${Math.round((100 * large) / 12)}%`
    attrs.class += ` column col-sm-${small}`

    delete attrs.large
    delete attrs.small

    return ([
      <td {...attrs} width={largeWidth} style={`width: ${largeWidth};`} align='left' valign='top'>
        {contents.length === 0 ? '&nbsp;' : contents}
      </td>,
      small === large ? '' : (<Style for='column' heml-embed>{`
         @media only screen and (max-width: ${breakpoint}px) {
          .column, .column-filler { float: left; box-sizing: border-box; }
          .col-sm-${small} {
            width: ${Math.round((100 * small) / 12)}% !important;
            display: block;
          }
        }
      `}</Style>)
    ])
  }
})
