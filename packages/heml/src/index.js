async function render ($, options = {}) {
  const elements = [];
  const globals = {};

  console.log($)

  await preRenderElements(elements, globals)
  await renderElements(elements, globals)
  await postRenderElements(elements, globals)

  return { $, metadata };
}

async function preRenderElements (elements, globals) {
  elements.forEach(async (element) => element.preRender(globals))
}

async function postRenderElements (elements, globals) {
  elements.forEach(async (element) => element.postRender(globals))
}

(async function() {
  console.log(await render({a: '1'}, {}));
})();

export default render
