const heml = require('../packages/heml')
const fixtures = require('./__fixtures__')

describe('snapshots', () => {
  for (const filename in fixtures) {
    const simpleName = filename.replace(/\.fixture\.js$/, '')
    const fixture = fixtures[filename]

    test(simpleName, () => heml(fixture).then((result) => expect(result).toMatchSnapshot()))
  }
})
