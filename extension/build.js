import postcss from 'postcss'
import tailwindcss from '@tailwindcss/postcss'
import fs from 'fs'
import path from 'path'

const inputFile = 'src/popup.css'
const outputFile = 'dist/popup.css'

// Ensure output directory exists
const outputDir = path.dirname(outputFile)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Read input CSS
const css = fs.readFileSync(inputFile, 'utf8')

// Process with PostCSS and Tailwind
const processor = postcss([tailwindcss()])

processor.process(css, { from: inputFile, to: outputFile })
  .then(result => {
    fs.writeFileSync(outputFile, result.css)
    console.log(`✓ Built ${outputFile}`)
  })
  .catch(err => {
    console.error('Build failed:', err)
    process.exit(1)
  })
