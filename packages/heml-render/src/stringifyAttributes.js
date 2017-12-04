/** escapeless version of npmjs.com/stringify-attributes */
export default function stringifyAttributes (attrsObj) {
  const attributes = []
  const className = attrsObj['className']

  if (className) {
    delete attrsObj.className
    attrsObj['class'] = attrsObj['class'] || ''
  }


  for (let [ key, value ] of Object.entries(attrsObj)) {
    if (value === false) { continue }

    if (Array.isArray(value)) { value = value.join(' ') }

    if (key === 'class' && className) {
      value = `${value} ${Array.isArray(className) ? className.join(' ') : String(className)}`.trim()
    }

    value = value === true ? '' : `="${String(value)}"`

    attributes.push(`${key}${value}`)
  }

  return attributes.length > 0 ? ' ' + attributes.join(' ') : ''
}
