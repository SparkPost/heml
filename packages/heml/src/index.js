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
  elements.forEach(async (element) => await element.preRender(globals))
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

  $nodes.forEach(async ($node) => {
    const element = elementMap[$node[0].tagName];
    const { contents, attrs } = serializeNode($node);

    await element.render(attrs, contents, globals);
  })
}

async function postRenderElements (elements, globals) {
  elements.forEach(async (element) => await element.postRender(globals))
}

function serializeNode($node) {
  const contents = $node.html();
  const attrs = mapValues($node[0].attribs, (value) => {
    if (value === '' || value === 'true' || value === 'on')
      return true

    if (value === 'false' || value === 'off')
      return false

    return value
  });

  return { content, attrs };
}

(async function() {
  console.log(await render({a: '1'}, {}));
})();

export default render
