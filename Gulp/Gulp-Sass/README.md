# Gulp Sass Start Repository

- sass compilation
- html compression
- css compression
- js compression
- autoprefix
- source map
- webp generating
- image compression
- svg compression
- svg sprite
- font generating woff & woff2
- live development server

console command:

on first start run: `grunt basic`

the command generates fonts wff woff2, webp, compresses svg,
builds sprite svg from `icon-*.svg` — in souce folder for dev


next step: `grunt start`

the command compil style, autoprefix, source map, and will deploy a live development
server — in source folder for dev


next step: `grunt allbuild`

the command build pruduct version, copy files to build folder,
compress html, css, js, img  in sourve folder for dev


next step: `grunt test`

the command run server for test only — in build folder for test

command: `grunt build`

images are usually prepared and compressed once,
so you need to be able to do the assembly without this task


command: `grunt font`

the command individual for generates fonts
wff, woff2 — in source folder for dev


command: `grunt image`

the command individual for generates
webp, compresses svg — in source folder for dev


command: `grunt spritesvg`

the command individual for compresses svg,
builds sprite svg from `icon-*.svg` — in source folder for dev

when developing

open the second tab in the browser
http: // localhost: 3001 /
to open the server settings.
You can turn on outline highlighting or grid for debugging
in the debag section

enjoy
