# Gulp Sass Foundation Start Repository for Email
---
- sass compilation
- html compilation
- style inline
- minify html, image
- live development server
- send mail

Gulp

for development

first launch after download repository
console command:

  - `npm i`          - install devDependencies
  - `npm run build`  - full update dev and build


daily launch
console command:

  - `gulp start`     - compilation of styles and html and live reload server


for production

Compressing images is a long task,
it makes no sense to run it every time,
when you update the build without changing
the jpg png webp, so there are two commands - fullbuild and build

console command:

  - `gulp fullbuild` - full build production version and min all files
  - `gulp build`     - inline style and minify html for build,
  - `gulp testbuild` - server for test only
  - `gulp mail`      - sand mail

when developing:

open the second tab in the browser
http: // localhost: 3001 / (or the address that browsersync points for gui to the console)
to open the server settings.
You can turn on outline highlighting or grid for debugging
in the debag section

enjoy
