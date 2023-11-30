"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[452],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>f});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var c=n.createContext({}),s=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},u=function(e){var t=s(e.components);return n.createElement(c.Provider,{value:t},e.children)},p="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},b=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,c=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),p=s(r),b=o,f=p["".concat(c,".").concat(b)]||p[b]||d[b]||a;return r?n.createElement(f,i(i({ref:t},u),{},{components:r})):n.createElement(f,i({ref:t},u))}));function f(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,i=new Array(a);i[0]=b;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l[p]="string"==typeof e?e:o,i[1]=l;for(var s=2;s<a;s++)i[s]=r[s];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}b.displayName="MDXCreateElement"},5859:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>p,frontMatter:()=>a,metadata:()=>l,toc:()=>s});var n=r(7462),o=(r(7294),r(3905));const a={},i=void 0,l={unversionedId:"Adobe-illustrator/Ai\u5feb\u6377\u65b9\u6cd5",id:"Adobe-illustrator/Ai\u5feb\u6377\u65b9\u6cd5",title:"Ai\u5feb\u6377\u65b9\u6cd5",description:"\u9009\u4e2d\u753b\u677f",source:"@site/docs/Adobe-illustrator/Ai\u5feb\u6377\u65b9\u6cd5.md",sourceDirName:"Adobe-illustrator",slug:"/Adobe-illustrator/Ai\u5feb\u6377\u65b9\u6cd5",permalink:"/docs/Adobe-illustrator/Ai\u5feb\u6377\u65b9\u6cd5",draft:!1,editUrl:"https://github.com/divib-cc/divib-cc.github.io/docs/Adobe-illustrator/Ai\u5feb\u6377\u65b9\u6cd5.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Ai JSX \u811a\u672c\u7b14\u8bb0",permalink:"/docs/Adobe-illustrator/Ai\u65b9\u6cd5"},next:{title:"addEventListener",permalink:"/docs/Adobe-illustrator/addEventListener"}},c={},s=[{value:"\u9009\u4e2d\u753b\u677f",id:"\u9009\u4e2d\u753b\u677f",level:3},{value:"\u9009\u62e9\u5f53\u524d\u753b\u677f\u4e0a\u7684\u6240\u6709\u5bf9\u8c61",id:"\u9009\u62e9\u5f53\u524d\u753b\u677f\u4e0a\u7684\u6240\u6709\u5bf9\u8c61",level:3}],u={toc:s};function p(e){let{components:t,...r}=e;return(0,o.kt)("wrapper",(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h3",{id:"\u9009\u4e2d\u753b\u677f"},"\u9009\u4e2d\u753b\u677f"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"// \u9009\u4e2d\u753b\u677f\ndoc.artboards.setActiveArtboardIndex(i);\n")),(0,o.kt)("h3",{id:"\u9009\u62e9\u5f53\u524d\u753b\u677f\u4e0a\u7684\u6240\u6709\u5bf9\u8c61"},"\u9009\u62e9\u5f53\u524d\u753b\u677f\u4e0a\u7684\u6240\u6709\u5bf9\u8c61"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"// \u9009\u62e9\u5f53\u524d\u753b\u677f\u4e0a\u7684\u5bf9\u8c61,\u6ce8\u610f\u5bf9\u8c61\u7684\u9501\u5b9alocked,\u9690\u85cfhidden\ndoc.selectObjectsOnActiveArtboard();\n")))}p.isMDXComponent=!0}}]);