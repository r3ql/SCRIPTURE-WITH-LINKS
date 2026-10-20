import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, getPixelColor) {
  // getPixelColor(x, y) -> [r, g, b, a]
  const rawBytes = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawBytes[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelColor(x, y, width, height);
      rawBytes[offset++] = r;
      rawBytes[offset++] = g;
      rawBytes[offset++] = b;
      rawBytes[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(rawBytes);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const chunkType = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([chunkType, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeInt32BE(crc, 0);
    return Buffer.concat([len, chunkType, data, crcBuf]);
  }

  // Precomputed CRC table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return c ^ 0xffffffff;
  }

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate Scripture With Links Brand Icon (Sacred Deep Amber + Radiant Gold + Open Scripture)
function brandIconShader(x, y, w, h) {
  const nx = (x / w) * 2 - 1; // -1 to 1
  const ny = (y / h) * 2 - 1;
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background deep sacred amber gradient
  const grad = (y / h);
  let r = Math.round(69 * (1 - grad) + 35 * grad);
  let g = Math.round(26 * (1 - grad) + 20 * grad);
  let b = Math.round(3 * (1 - grad) + 18 * grad);
  let a = 255;

  // Squircle rounded corners
  const squircle = Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4);
  if (squircle > 0.85) {
    // Outer padding / safe zone
    return [0, 0, 0, 0];
  }

  // Gold circular halo ring
  if (dist >= 0.68 && dist <= 0.74) {
    return [245, 158, 11, 255]; // Golden ring
  }

  // Central Open Bible glyph representation
  // Bible left page: -0.45 <= nx <= -0.05, -0.25 <= ny <= 0.35
  // Bible right page: 0.05 <= nx <= 0.45, -0.25 <= ny <= 0.35
  const inLeftPage = (nx >= -0.45 && nx <= -0.05 && ny >= -0.25 && ny <= 0.35);
  const inRightPage = (nx >= 0.05 && nx <= 0.45 && ny >= -0.25 && ny <= 0.35);

  if (inLeftPage || inRightPage) {
    // Parchment color
    r = 254; g = 243; b = 199;
    // Scripture text lines
    const lineY = (ny + 0.25) * 10;
    const isLine = Math.floor(lineY) % 2 === 1 && (lineY - Math.floor(lineY) < 0.45);
    if (isLine) {
      r = 161; g = 98; b = 7; // Gold-amber text line
    }
    return [r, g, b, 255];
  }

  // Center spine divider
  if (Math.abs(nx) <= 0.04 && ny >= -0.25 && ny <= 0.35) {
    return [180, 83, 9, 255];
  }

  // Radiant Cross above Scripture: -0.45 <= ny <= -0.28
  if (Math.abs(nx) <= 0.04 && ny >= -0.55 && ny <= -0.28) {
    return [254, 240, 138, 255]; // Vertical beam
  }
  if (Math.abs(nx) <= 0.22 && ny >= -0.48 && ny <= -0.42) {
    return [254, 240, 138, 255]; // Horizontal beam
  }

  return [r, g, b, a];
}

// Generate all target PNG files
fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, brandIconShader));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, brandIconShader));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, brandIconShader));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, brandIconShader));

console.log('Successfully generated compliant 192x192, 512x512, maskable, and apple-touch-icon PNG files!');
