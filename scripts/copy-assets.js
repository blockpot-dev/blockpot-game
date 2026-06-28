/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs-extra')
const path = require('path')

const assetRoot = path.join(__dirname, '../node_modules/@blockpot-dev/blockpot-design-system/dist/assets')
const publicRoot = path.join(__dirname, '../public/assets')

// Copy svgs, pngs, and fonts. SVGs are referenced at absolute paths like
// `/assets/svgs/blockpot-ring.svg` (design-system's .masked-vortex), so they
// must live under public/assets/. Fonts are referenced by the design-system's
// @font-face rules via a relative URL (`../assets/fonts/...` from dist/styles/)
// and resolve against node_modules — but we keep them mirrored under
// public/assets/fonts/ as a belt-and-braces against any consumer CSS that
// expects them at a site-absolute path.
for (const sub of ['svgs', 'pngs', 'fonts']) {
    const src = path.join(assetRoot, sub)
    const dest = path.join(publicRoot, sub)
    if (fs.existsSync(src)) {
        fs.copySync(src, dest, { dereference: true })
    }
}

console.log('✅ Copied svgs/pngs/fonts from blockpot-design-system to /public/assets/')