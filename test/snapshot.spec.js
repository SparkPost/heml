const heml = require('../packages/heml')
const fixtures = require('./__fixtures__')

for (const filename in fixtures) {
  const testName = filename.replace(/\.fixture\.js$/, '')
  const fixture = fixtures[filename]

  test(testName, () => heml(fixture).then((result) => expect(result).toMatchSnapshot()))
}
