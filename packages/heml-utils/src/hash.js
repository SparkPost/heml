import { unique as shorthash } from 'shorthash'

export default function hash(str, prefix = 'h') {
  return `${prefix}${shorthash(str)}`
}
