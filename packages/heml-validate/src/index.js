import * as validatorsObject from './validators'

const validators = Object.values(validatorsObject)

/**
* Validate that a cheerio instance contains valid HEML
* @param  {Cheero} $         the heml cheerio
* @param  {Object} options
* @return {Array[HEMLError]} an array of heml errors
*/
export default function validate ($, options = {}) {
  const {
    elements = []
  } = options

  let errors = []

  for (let element of elements) {
    const matchedValidators = validators.filter((validator) => validator.name in element)

    if (matchedValidators.length === 0) { return }

    const $nodes = $.findNodes(element.tagName)

    $nodes.forEach(($node) => matchedValidators.forEach((validator) => {
      try {
        validator($node, element, $)
      } catch (e) {
        errors.push(e)
      }
    }))
  }

  return errors
}
