#!/usr/bin/env node
/**
 * Generates all PWA icon sizes from a source SVG.
 * Usage: node scripts/generate-icons.js
 * Requires: npm install sharp
 * Place your source icon at: public/icons/source.svg (1024x1024 recommended)
 */
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const SOURCE = path.resolve(__dirname, '../public/icons/source.svg')
const OUTPUT_DIR = path.resolve(__dirname, '../public/icons')

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

// SVG source — teal background with white M letter
const DEFAULT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="192" fill="#0D9488"/>
  <text
    x="512"
    y="512"
    font-family="Inter, Arial, sans-serif"
    font-size="600"
    font-weight="700"
    fill="white"
    text-anchor="middle"
    dominant-baseline="central"
  >M</text>
</svg>
`

async function generateIcons() {
  // Write default SVG if source doesn't exist
  const sourcePath = fs.existsSync(SOURCE)
    ? SOURCE
    : (() => {
        const tmpPath = path.resolve(OUTPUT_DIR, 'source.svg')
        fs.writeFileSync(tmpPath, DEFAULT_SVG)
        console.log('📝 Created default source SVG at public/icons/source.svg')
        return tmpPath
      })()

  console.log('🎨 Generating PWA icons...\n')

  await Promise.all(
    SIZES.map(async (size) => {
      const outputPath = path.resolve(OUTPUT_DIR, `icon-${size}x${size}.png`)
      await sharp(sourcePath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 13, g: 148, b: 136, alpha: 1 }, // #0D9488
        })
        .png({ quality: 90, compressionLevel: 8 })
        .toFile(outputPath)
      console.log(`  ✅ icon-${size}x${size}.png (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`)
    })
  )

  // Also generate apple-touch-icon
  await sharp(sourcePath)
    .resize(180, 180)
    .png({ quality: 90 })
    .toFile(path.resolve(__dirname, '../public/apple-touch-icon.png'))
  console.log('  ✅ apple-touch-icon.png (180x180)')

  // Generate favicon.ico (32x32)
  await sharp(sourcePath)
    .resize(32, 32)
    .png({ quality: 90 })
    .toFile(path.resolve(__dirname, '../public/favicon-32x32.png'))
  console.log('  ✅ favicon-32x32.png')

  console.log('\n✨ All icons generated successfully!')
  console.log('📋 Add to your <head>:')
  console.log('   <link rel="apple-touch-icon" href="/apple-touch-icon.png" />')
  console.log('   <link rel="icon" sizes="32x32" href="/favicon-32x32.png" />')
}

generateIcons().catch((err) => {
  console.error('❌ Icon generation failed:', err)
  process.exit(1)
})