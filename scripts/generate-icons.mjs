import sharp from 'sharp'
import { writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// SVG icon: dark background with a white plane
function makeSvg(size) {
  const pad = size * 0.15
  const inner = size - pad * 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#111111"/>
  <g transform="translate(${pad}, ${pad}) scale(${inner / 24})">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
      fill="white"/>
  </g>
</svg>`
}

const sizes = [192, 512]

for (const size of sizes) {
  const svg = Buffer.from(makeSvg(size))
  const outPath = path.join(__dirname, `../public/icons/icon-${size}x${size}.png`)
  await sharp(svg).png().toFile(outPath)
  console.log(`Generated ${outPath}`)
}
