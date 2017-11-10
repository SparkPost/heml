import { unique } from 'shorthash'

/**
 * generates a consistent short class-safe hash from a longer string
 * @param  {String} str the string used in the hash function
 * @return {String}     the class
 */
export default function toClass(s) {
  return `c${unique(s)}`
}
