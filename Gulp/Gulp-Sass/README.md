# Gulp Sass Start Repository
---
- sass compilation
- webp generation
- minify html, css, js, image
- svg min, sprite and inject to html
- font convert to woff & woff2
- live development server

Gulp

for development

first launch after download repository
console command:

- `npm i`          - install devDependencies
- `npm run build`  - full update dev and build


daily launch
console command:

- `gulp fullstart` - first start, full update for development (css, webp, svgmin, svgsprite inject in html, fontgen)
- `gulp start`     - compilation of styles and live reload server
- `gulp imgstart`  - webp update and generation
- `gulp svgstart`  - svg update minify and svgsprite inject to html
- `gulp fontstart` - font update convert to woff & woff2


for production

Compressing images is a long task,
it makes no sense to run it every time,
when you update the build without changing
the jpg png webp, so there are two commands - fullbuild and build

console command:

- `gulp fullbuild` - full build production version and min all files
- `gulp build`     - copy font, copy and minify html, css, js
- `gulp testbuild` - server for test only (for example for testing lighthouse)

when developing:

open the second tab in the browser
http: // localhost: 3001 / (or the address that browsersync points for gui to the console)
to open the server settings.
You can turn on outline highlighting or grid for debugging
in the debag section

enjoy
