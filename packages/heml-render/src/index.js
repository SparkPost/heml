import { filter, difference, keyBy, mapValues } from 'lodash'

async function render ($, options = {}) {
  const elements = [];
  const metadata = {};
  const globals = { $, metadata };

  await preRenderElements(elements, globals)
  await renderElements(elements, globals)
  await postRenderElements(elements, globals)

  return { $, metadata };
}

async function preRenderElements (elements, globals) {
  for (let element of elements) {
    await element.preRender(globals);
  }
}

async function renderElements (elements, globals) {
  const { $ } = globals;
  const elementMap = keyBy(elements, 'tagName');
  const metaTagNames = filter(allElementMap, { parent: [ 'head' ] }).map(({ tagName }) => tagName);
  const nonMetaTagNames = difference(elements.map(({ tagName }) => tagName), metaTagNames);

  const $nodes = [
    ...$.findNodes(metaTagNames), /** Render the meta elements first */
    ...$.findNodes(nonMetaTagNames).reverse() /** Render the elements last to first */
  ];

  for (let $node of $nodes) {
    const element = elementMap[$node[0].tagName];
    const { contents, attrs } = serializeNode($node);

    await element.render(attrs, contents, globals);
  }
}

/**
 * Run the async postRender functions for each element
 * @param  {Array}  elements  List of element definitons
 * @param  {Object} globals
 * @return {Promise}          [description]
 */
async function postRenderElements (elements, globals) {
  for (let element of elements) {
    await element.postRender(globals);
  }
}

/**
 * Pull off the attributes and content of a $node
 * @param  {Node} $node Cheerio node
 * @return {Object}       { contents, attrs }
 */
function serializeNode($node) {
  const contents = $node.html();
  const attrs = mapValues($node[0].attribs, (value) => {
    if (value === '' || value === 'true' || value === 'on')
      return true

    if (value === 'false' || value === 'off')
      return false

    return value
  });

  return { contents, attrs };
}

(async function() {
  console.log(await render({a: '1'}, {}));
})();

export default render
