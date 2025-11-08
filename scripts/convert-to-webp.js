import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '../public/images');
const quality = 80; // WebP quality (0-100)

async function convertToWebP() {
  try {
    const files = fs.readdirSync(imagesDir);
    const jpgFiles = files.filter(file => file.match(/\.(jpg|jpeg)$/i));
    
    console.log(`Found ${jpgFiles.length} JPG files to convert...`);
    
    for (const file of jpgFiles) {
      const inputPath = path.join(imagesDir, file);
      const outputPath = path.join(imagesDir, file.replace(/\.(jpg|jpeg)$/i, '.webp'));
      
      console.log(`Converting ${file}...`);
      
      await sharp(inputPath)
        .webp({ quality })
        .toFile(outputPath);
      
      const inputSize = fs.statSync(inputPath).size;
      const outputSize = fs.statSync(outputPath).size;
      const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);
      
      console.log(`  ✓ Saved ${savings}% (${(inputSize / 1024).toFixed(0)}KB → ${(outputSize / 1024).toFixed(0)}KB)`);
    }
    
    console.log('\n✨ Conversion complete!');
    console.log(`\nTo delete original JPG files, run:`);
    console.log(`rm ${imagesDir}/*.jpg`);
    
  } catch (error) {
    console.error('Error converting images:', error);
    process.exit(1);
  }
}

convertToWebP();

