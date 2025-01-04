"use strict";(self.webpackChunkdocusaurus=self.webpackChunkdocusaurus||[]).push([[5499],{5039:(e,r,t)=>{t.r(r),t.d(r,{assets:()=>l,contentTitle:()=>i,default:()=>p,frontMatter:()=>a,metadata:()=>n,toc:()=>c});const n=JSON.parse('{"id":"Ai_JSX\u811a\u672c/AverageStrokesWidth","title":"AverageStrokesWidth","description":"BatchRenamer.jsx","source":"@site/docs/Ai_JSX\u811a\u672c/AverageStrokesWidth.md","sourceDirName":"Ai_JSX\u811a\u672c","slug":"/Ai_JSX\u811a\u672c/AverageStrokesWidth","permalink":"/docs/Ai_JSX\u811a\u672c/AverageStrokesWidth","draft":false,"unlisted":false,"editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/Ai_JSX\u811a\u672c/AverageStrokesWidth.md","tags":[],"version":"current","frontMatter":{},"sidebar":"tutorialSidebar","previous":{"title":"AverageColors\u5e73\u5747\u989c\u8272","permalink":"/docs/Ai_JSX\u811a\u672c/AverageColors\u5e73\u5747\u989c\u8272"},"next":{"title":"ColorBlindSimulator","permalink":"/docs/Ai_JSX\u811a\u672c/ColorBlindSimulator"}}');var s=t(4848),o=t(8453);const a={},i=void 0,l={},c=[];function u(e){const r={a:"a",code:"code",img:"img",p:"p",pre:"pre",...(0,o.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(r.p,{children:(0,s.jsx)(r.a,{target:"_blank","data-noBrokenLinkCheck":!0,href:t(1133).A+"",children:"BatchRenamer.jsx"})}),"\n",(0,s.jsx)(r.p,{children:(0,s.jsx)(r.img,{alt:"AverageStrokesWidth",src:t(9407).A+"",width:"750",height:"390"})}),"\n",(0,s.jsx)(r.pre,{children:(0,s.jsx)(r.code,{className:"language-jsx",children:"/*\r\n  AverageStrokesWidth.jsx for Adobe Illustrator\r\n  Description: Averages the stroke width of selected objects, skipping those without strokes. Supports paths, compound paths and text objects\r\n  Date: February, 2023\r\n  Author: Sergey Osokin, email: hi@sergosokin.ru\r\n\r\n  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts\r\n\r\n  Release notes:\r\n  0.1 Initial version\r\n\r\n  Donate (optional):\r\n  If you find this script helpful, you can buy me a coffee\r\n  - via Buymeacoffee: https://www.buymeacoffee.com/osokin\r\n  - via FanTalks https://fantalks.io/r/sergey\r\n  - via DonatePay https://new.donatepay.ru/en/@osokin\r\n  - via YooMoney https://yoomoney.ru/to/410011149615582\r\n\r\n  NOTICE:\r\n  Tested with Adobe Illustrator CC 2019-2023 (Mac/Win).\r\n  This script is provided \"as is\" without warranty of any kind.\r\n  Free to use, not for sale\r\n\r\n  Released under the MIT license\r\n  http://opensource.org/licenses/mit-license.php\r\n\r\n  Check my other scripts: https://github.com/creold\r\n*/\r\n\r\n//@target illustrator\r\napp.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file\r\n\r\n// Main function\r\nfunction main() {\r\n  if (!isCorrectEnv('selection')) return;\r\n\r\n  var items = getStrokedItems(selection, true);\r\n  if (!items.length) return;\r\n\r\n  var totalW = getTotalWidth(items),\r\n      avgW = 1 * (totalW / items.length).toFixed(2);\r\n\r\n  items = getStrokedItems(selection, false);\r\n  for (var i = 0, len = items.length; i < len; i++) {\r\n    setStrokeWidth(items[i], avgW);\r\n  }\r\n}\r\n\r\n// Check the script environment\r\nfunction isCorrectEnv() {\r\n  var args = ['app', 'document'];\r\n  args.push.apply(args, arguments);\r\n  for (var i = 0; i < args.length; i++) {\r\n    var arg = args[i].toString().toLowerCase();\r\n    switch (true) {\r\n      case /app/g.test(arg):\r\n        if (!/illustrator/i.test(app.name)) {\r\n          alert('Wrong application\\nRun script from Adobe Illustrator', 'Script error');\r\n          return false;\r\n        }\r\n        break;\r\n      case /version/g.test(arg):\r\n        var rqdVers = parseFloat(arg.split(':')[1]);\r\n        if (parseFloat(app.version) < rqdVers) {\r\n          alert('Wrong app version\\nSorry, script only works in Illustrator v.' + rqdVers + ' and later', 'Script error');\r\n          return false;\r\n        }\r\n        break;\r\n      case /document/g.test(arg):\r\n        if (!documents.length) {\r\n          alert('No documents\\nOpen a document and try again', 'Script error');\r\n          return false;\r\n        }\r\n        break;\r\n      case /selection/g.test(arg):\r\n        if (!selection.length || selection.typename === 'TextRange') {\r\n          alert('Nothing selected\\nPlease, select two or more paths', 'Script error');\r\n          return false;\r\n        }\r\n        break;\r\n    }\r\n  }\r\n  return true;\r\n}\r\n\r\n// Get paths from selection\r\nfunction getStrokedItems(coll, isFirstPath) {\r\n  var out = [];\r\n  for (var i = 0; i < coll.length; i++) {\r\n    var item = coll[i];\r\n    if (isType(item, 'group') && item.pageItems.length) {\r\n      out = [].concat(out, getStrokedItems(item.pageItems));\r\n    } else if (isType(item, '^compound') && item.pathItems.length) {\r\n      // Get only first path from PathItems collection\r\n      if (isFirstPath) {\r\n        if (isHasStroke(item.pathItems[0])) out.push(item.pathItems[0]);\r\n      } else {  // Get all PathItems\r\n        out = [].concat(out, getStrokedItems(item.pathItems));\r\n      }\r\n    } else if (isType(item, 'path|text')) {\r\n      if (isHasStroke(item)) out.push(item);\r\n    }\r\n  }\r\n  return out;\r\n}\r\n\r\n// Check the item typename by short name\r\nfunction isType(item, type) {\r\n  var regexp = new RegExp(type, 'i');\r\n  return regexp.test(item.typename);\r\n}\r\n\r\n// Check for a stroke\r\nfunction isHasStroke(item) {\r\n  if (isType(item, 'text')) {\r\n    var attr = item.textRange.characterAttributes;\r\n    return !/nocolor/i.test(attr.strokeColor) && attr.strokeWeight > 0;\r\n  }\r\n  return item.stroked && item.strokeWidth > 0;\r\n}\r\n\r\n// Get the sum of the stroke widths\r\nfunction getTotalWidth(coll) {\r\n  var total = 0;\r\n  for (var i = 0, len = coll.length; i < len; i++) {\r\n    if (isType(coll[i], 'text')) {\r\n      var attr = coll[i].textRange.characterAttributes;\r\n      total += attr.strokeWeight;\r\n    } else {\r\n      total += coll[i].strokeWidth;\r\n    }\r\n  }\r\n  return total;\r\n}\r\n\r\n// Set stroke width\r\nfunction setStrokeWidth(item, val) {\r\n  if (val == undefined || val == 0) return;\r\n  if (isType(item, 'text')) {\r\n    var attr = item.textRange.characterAttributes;\r\n    attr.strokeWeight = val;\r\n  } else {\r\n    item.strokeWidth = val;\r\n  }\r\n}\r\n\r\n// Run script\r\ntry {\r\n  main();\r\n} catch (err) {}```\n"})})]})}function p(e={}){const{wrapper:r}={...(0,o.R)(),...e.components};return r?(0,s.jsx)(r,{...e,children:(0,s.jsx)(u,{...e})}):u(e)}},1133:(e,r,t)=>{t.d(r,{A:()=>n});const n=t.p+"assets/files/BatchRenamer-5a8be486129f2dbf79027b83aa1a920c.jsx"},9407:(e,r,t)=>{t.d(r,{A:()=>n});const n=t.p+"assets/images/AverageStrokesWidth-03e3d7605861cb61e33d2e697e939aac.gif"},8453:(e,r,t)=>{t.d(r,{R:()=>a,x:()=>i});var n=t(6540);const s={},o=n.createContext(s);function a(e){const r=n.useContext(o);return n.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function i(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:a(e.components),n.createElement(o.Provider,{value:r},e.children)}}}]);