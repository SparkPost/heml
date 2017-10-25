# HEML

HEML is an open source markup language for building responsive email.

- **Native Feel:** Do you know HTML and CSS? Check out our docs and you're off to the races! No special rules or styling paradigms to master.

- **Forward Thinking:** HEML is designed to take advantage of all that email can do while still providing a solid experience for all clients.

- **Extendable:** You can create your own powerful elements and style rules. Share them with the world, or keep em to yourself. Your choice.


##### [Try it out!](https://heml.io/editor)


## Table of Contents
* [Getting Started](https://heml.io/docs/getting-started)
* [Email Structure](https://heml.io/docs/email-structure)
* [Styling](https://heml.io/docs/styling)
* [Elements](https://heml.io/docs/elements)


## Code with HEML

To use HEML in your node project, install it with:

```sh
npm install heml --save
```

In your code, pull the package in. It takes two parameters: the HEML you want to convert and any custom options you have defined. Once finished, HEML will return a Promise with an object containing the generated HTML and any metadata collected. If `validate` is set to `soft`, an array of any errors will also be included.

```js
const HEML = require('heml')

HEML(`
  <heml>
    <head>
      <subject>My email</subject>
    </head>
    <body>
      <h1>Hi there!</h1>
    </body>
  </heml>
`, {
  validate: 'soft'
})
.then(({ metadata, html, errors }) => {
  console.log(html)
})

```


### Options

```js
{
  validate: 'strict'|'soft'|'none', // defaults to 'soft'
  cheerio: {} // config passed to cheerio parser
  juice: {},
  beautify: {} // config passed to js-beautify html method
  elements: [
    // any custom elements you want to use
  ]
}
```
