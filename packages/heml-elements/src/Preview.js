import HEML, { createMetaElement } from '@heml/utils' // eslint-disable-line no-unused-vars
import Meta from './Meta'

export default createMetaElement('preview', {
  parent: [ 'head' ],
  unique: true,

  render (attrs, contents) {
    Meta.set('preview', contents)

    return false
  },

  flush () {
    const preview = Meta.get('preview')

    return preview ? <div class='preview' style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;'>{preview}{'&nbsp;&zwnj;'.repeat(200 - preview.length)}</div> : ''
  }
})
