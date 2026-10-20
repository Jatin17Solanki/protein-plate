// Writes the app icons to public/icons/ (run `npm run icons` after changing the logo or brand colour; commit the PNGs).
import { mkdirSync, writeFileSync } from 'node:fs';
import { iconImage } from './build/og';

(async () => {
  mkdirSync('public/icons', { recursive: true });
  const out: [string, number, number][] = [
    ['icon-192.png', 192, 0],
    ['icon-512.png', 512, 0],
    ['maskable-512.png', 512, 0.1], // content inside the 80 % safe zone
    ['apple-touch-icon.png', 180, 0],
    ['favicon-32.png', 32, 0],
  ];
  for (const [name, size, pad] of out) {
    writeFileSync(`public/icons/${name}`, await iconImage(size, pad));
    console.log(`public/icons/${name}`);
  }
})();
