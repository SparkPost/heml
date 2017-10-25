/**
 * remove all ids used for processing only
 * @param  {Cheerio} $
 */
function removeProcessingIds ($) {
  $('[id^="heml-"]').removeAttr('id')
}

export default removeProcessingIds
