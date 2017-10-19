/**
 * builds the html that gets rendered when there are heml errors
 * @param  {Array}         errors an array of HEMLErrors
 * @return {String}        some html
 */
export default function (errors = []) {
  const title = `${errors.length} validation ${errors.length > 1 ? 'errors' : 'error'}`
  return `
  <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          background: #262626;
          color: #e8e8e8;
          font-family: Menlo, Consolas, monospace
        }

        h3 {
          background: #E36049;
          border-radius: 3px;
          padding: 3px 8px;
          display: inline-block;
        }

        #errors {
          width: 80%;
          max-width: 700px;
        }

        .message {
          margin-bottom: 1em;
        }

        .selector {
          margin-bottom: .25em;
        }

        .hidden {
          opacity: 0;
        }
      </style>
    </head>
    <body>
      <h3>${title}</h3><br />

      <div id="errors">
        ${errors.map((error) => `
          <div class="message">
            <div class="selector">&gt; ${error.selector}</div>
            <span class="hidden">&gt;</span> ${error.toString()}
          </div>`).join('')}
      </div>
      <script src="/reload/reload.js"> </script>
    </body>
  </html>
  `
}
