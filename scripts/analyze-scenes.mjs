import fs from 'fs';
import path from 'path';

const COMPOSITIONS_DIR = path.join(process.cwd(), 'src/compositions');

const scenes = [];
for (let i = 1; i <= 21; i++) {
  const num = i.toString().padStart(2, '0');
  const file = path.join(COMPOSITIONS_DIR, `Scene${num}.tsx`);
  if (!fs.existsSync(file)) continue;

  const content = fs.readFileSync(file, 'utf-8');
  
  // Extract LAYOUT block
  const layoutMatch = content.match(/const LAYOUT[:\s\w]*= (\{[\s\S]*?\});/);
  if (layoutMatch) {
    try {
      const layoutStr = layoutMatch[1];
      const main = content.match(/main:\s*(\{.*?\})/);
      const sub = content.match(/sub:\s*(\{.*?\})/);
      const subtitle = content.match(/subtitle:\s*(\{[\s\S]*?\n\s*\},?)/);
      const leftChar = content.match(/leftChar:\s*(\{.*?\})/);
      const rightChar = content.match(/rightChar:\s*(\{.*?\})/);

      scenes.push({
        scene: num,
        main: main ? main[1] : null,
        sub: sub ? sub[1] : null,
        subtitle: subtitle ? subtitle[1].trim() : null,
        leftChar: leftChar ? leftChar[1] : null,
        rightChar: rightChar ? rightChar[1] : null,
      });
    } catch (err) {
      console.error('Error on ', num, err);
    }
  }
}

// Convert extracted data back to a readable text dump
for (const s of scenes) {
  console.log(`--- Scene ${s.scene} ---`);
  console.log(`Main      : ${s.main || 'none'}`);
  console.log(`Sub       : ${s.sub || 'none'}`);
  console.log(`LeftChar  : ${s.leftChar || 'none'}`);
  console.log(`RightChar : ${s.rightChar || 'none'}`);
}
