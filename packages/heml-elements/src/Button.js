import HEML, { createElement, transforms, cssGroups } from '@heml/utils' // eslint-disable-line no-unused-vars
import { omit, pick } from 'lodash'

const {
  background,
  margin,
  padding,
  border,
  borderRadius,
  width,
  height,
  table,
  text,
  font,
  box } = cssGroups

export default createElement('button', {
  attrs: [ 'href', 'target' ],
  defaultAttrs: {
    href: '#'
  },

  rules: {
    root: [ { display: transforms.trueHide('block') } ],
    table: [ margin, table ],
    cell: [ background, padding, borderRadius, border, height, width, box ],
    link: [ background, text, font ],
    text: [ 'color', 'text-decoration' ]
  },

  css (Style) {
    return <Style>{`
      button {
        margin: auto;
        border-radius: 3px;
        padding: 6px 12px;
        background-color: #2097e4;
        color: #ffffff;
        text-decoration: none;
      }
    `}</Style>
  },

  render (attrs, contents) {
    const { rules, ...defaultAttrs } = attrs

    return (
      <div {...omit(defaultAttrs, [ 'href', 'target' ])} {...rules.root}>
        <table role='presentation' width='100%' align='left' border='0' cellpadding='0' cellspacing='0'>
          <tr>
            <td>
              <table  {...rules.table} role='presentation' width='auto' align='center' border='0' cellspacing='0' cellpadding='0'>
                <tr>
                  <td  {...rules.cell} align='center'>
                    <a  {...rules.link} {...pick(attrs, [ 'href', 'target' ])} style='display: inline-block;'>
                      <span {...rules.text}>{contents}</span>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>)
  }
})
