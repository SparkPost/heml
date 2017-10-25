import HEML, { createElement } from '@heml/utils' // eslint-disable-line no-unused-vars

export default createElement('font', {
  parent: [ 'head' ],
  children: false,
  defaultAttrs: { href: '' },

  render (attrs, contents) {
    return ([
      `<!--[if !mso]><!-->`,
      <link href={attrs.href} rel='stylesheet' type='text/css' />,
      <style type='text/css'>
        {`@import url(${attrs.href});`}
      </style>,
      `<!--<![endif]-->`
    ])
  }
})
