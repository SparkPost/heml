import HEML, { createElement } from '@heml/utils' // eslint-disable-line no-unused-vars
import Subject from './Subject'

export default createElement('head', {
  unique: true,
  parent: [ 'heml' ],
  attrs: [],

  async render (attrs, contents) {
    return ([
      <head>{/* Fake head for Yahoo */} </head>,
      <head {...attrs}>
        <meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta name='x-apple-disable-message-reformatting' />

        {/* <!-- https://webdesign.tutsplus.com/tutorials/creating-a-future-proof-responsive-email-without-media-queries--cms-23919 --> */
      `<!--[if !mso]><!-->`}
        <meta http-equiv='X-UA-Compatible' content='IE=edge' />
        {`<!--<![endif]-->`}

        {/* http://tabletrtd.com/opening-css-resets/ */}
        <style type='text/css' data-embed>{`
        * { text-size-adjust: 100%; -ms-text-size-adjust: 100%; -moz-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
        html { height: 100%; width: 100%; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; mso-line-height-rule: exactly; }
        div[style*="margin: 16px 0"] { margin:0 !important; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;}
        .ReadMsgBody, .ExternalClass { width: 100%; }
        .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass td, .ExternalClass div { line-height: 100%; }
      `}</style>
        <style type='text/css'>{`
        h1, h2, h3, h4, h5, h6 { margin: 20px 0; }
        h1 { line-height: 40px; }
        h2 { line-height: 30px; }
        h3 { line-height: 24px; }
        h5 { line-height: 17px; }
        h6 { line-height: 12px; }
        p { display: block; margin: 14px 0; }
        ul { margin-left: 20px; margin-top: 16px; margin-bottom: 16px; padding: 0; list-style-type: disc; }
      `}</style>
        {`<!--[if gte mso 9]>
      <style type="text/css">
      li { text-indent: -1em; }
      table td { border-collapse: collapse; }
      </style>
      <![endif]-->`}
        <title>{Subject.flush()}</title>
        {/* drop in the contents */
      contents}
        {/* https://litmus.com/community/discussions/151-mystery-solved-dpi-scaling-in-outlook-2007-2013 */
      `<!--[if gte mso 9]><xml>
       <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
       </o:OfficeDocumentSettings>
      </xml><![endif]-->`}
      </head>])
  }
})
