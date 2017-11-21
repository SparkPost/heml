import stringifyAttributes from './stringifyAttributes'
import selfClosingHtmlTags from 'html-tags/void'

export default function createHtmlElement ({ name, attrs, contents = ' ' }) {
  if (selfClosingHtmlTags.includes(name)) {
    return `<${name}${attrs ? stringifyAttributes(attrs) : ''} />`
  }

  return `<${name}${attrs ? stringifyAttributes(attrs) : ''}>${contents || ' '}</${name}>`
}
