import HEML, { createElement, transforms } from '@heml/utils' // eslint-disable-line no-unused-vars

const Table = createElement('table', {
  attrs: true,
  containsText: true,
  rules: { root: [ '@default', { display: transforms.trueHide('table') } ] },

  render (attrs, contents) {
    const { rules, ...defaultAttrs } = attrs

    return <table {...defaultAttrs} {...rules.root}>{contents}</table>
  }
})

const Tr = createElement('tr', {
  attrs: true,
  containsText: true,
  rules: { root: [ '@default' ] },

  render (attrs, contents) {
    const { rules, ...defaultAttrs } = attrs

    return <tr {...defaultAttrs} {...rules.root}>{contents}</tr>
  }
})

const Td = createElement('td', {
  attrs: true,
  containsText: true,
  rules: { root: [ '@default' ] },

  render (attrs, contents) {
    const { rules, ...defaultAttrs } = attrs

    return <td {...defaultAttrs} {...rules.root}>{contents}</td>
  }
})

export { Table, Tr, Td }
