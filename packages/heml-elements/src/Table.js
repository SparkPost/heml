import HEML, { createElement, transforms } from '@heml/utils' // eslint-disable-line no-unused-vars

const Table = createElement('table', {
  attrs: true,
  containsText: true,
  rules: {
    '.table': [ { '@pseudo': 'root' }, '@default', { display: transforms.trueHide('table') } ]
  },

  render (attrs, contents) {
    attrs.class += ' table'
    return <table {...attrs}>{contents}</table>
  }
})

const Tr = createElement('tr', {
  attrs: true,
  containsText: true,
  rules: {
    '.tr': [ { '@pseudo': 'root' }, '@default' ]
  },

  render (attrs, contents) {
    attrs.class += ' tr'
    return <tr {...attrs}>{contents}</tr>
  }
})

const Td = createElement('td', {
  attrs: true,
  containsText: true,
  rules: {
    '.td': [ { '@pseudo': 'root' }, '@default' ]
  },

  render (attrs, contents) {
    attrs.class += ' td'
    return <td {...attrs}>{contents}</td>
  }
})

export { Table, Tr, Td }
