const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('C:/Users/PC/.gemini/antigravity/brain/47b1bbf8-bba6-4981-a857-070d0cae15fc/scratch/node_modules/sharp');

// 1. dHash (Difference Hash) - 64 bits
async function computeDHash(imagePath) {
  const { data } = await sharp(imagePath)
    .resize(9, 8, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  let hash = BigInt(0);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const left = data[row * 9 + col];
      const right = data[row * 9 + col + 1];
      hash = (hash << 1n) | (left > right ? 1n : 0n);
    }
  }
  return hash.toString(16).padStart(16, '0');
}

// 2. aHash (Average Hash) - 64 bits
async function computeAHash(imagePath) {
  const { data } = await sharp(imagePath)
    .resize(8, 8, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  let sum = 0;
  for (let i = 0; i < 64; i++) sum += data[i];
  const avg = sum / 64;

  let hash = BigInt(0);
  for (let i = 0; i < 64; i++) {
    hash = (hash << 1n) | (data[i] > avg ? 1n : 0n);
  }
  return hash.toString(16).padStart(16, '0');
}

// 3. pHash (DCT Perceptual Hash) - 64 bits
async function computePHash(imagePath) {
  const N = 32;
  const { data } = await sharp(imagePath)
    .resize(N, N, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 1D DCT on rows then columns
  const matrix = Array.from({ length: N }, (_, r) => 
    Array.from({ length: N }, (_, c) => data[r * N + c])
  );

  const dct = Array.from({ length: N }, () => new Float64Array(N));
  const cCoeff = (u) => (u === 0 ? 1 / Math.sqrt(2) : 1);

  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 8; v++) {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          sum += matrix[i][j] * 
            Math.cos(((2 * i + 1) * u * Math.PI) / (2 * N)) * 
            Math.cos(((2 * j + 1) * v * Math.PI) / (2 * N));
        }
      }
      dct[u][v] = (2 / N) * cCoeff(u) * cCoeff(v) * sum;
    }
  }

  // Collect top 8x8 excluding (0,0)
  const vals = [];
  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 8; v++) {
      if (u === 0 && v === 0) continue;
      vals.push(dct[u][v]);
    }
  }
  const sorted = [...vals].sort((a, b) => a - b);
  const median = (sorted[Math.floor(sorted.length / 2)] + sorted[Math.ceil(sorted.length / 2)]) / 2;

  let hash = BigInt(0);
  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 8; v++) {
      const bit = (u === 0 && v === 0) ? 0n : (dct[u][v] > median ? 1n : 0n);
      hash = (hash << 1n) | bit;
    }
  }
  return hash.toString(16).padStart(16, '0');
}

// 4. Brightness & Laplacian Variance (Sharpness)
async function computeVisualStats(imagePath) {
  // Use a standardized 512px max dimension for fair variance comparison across diff resolutions
  const img = sharp(imagePath);
  const meta = await img.metadata();
  
  const { data, info } = await sharp(imagePath)
    .resize(512, 512, { fit: 'inside' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const total = w * h;

  // Mean brightness
  let sum = 0;
  for (let i = 0; i < total; i++) sum += data[i];
  const meanBrightness = sum / total;

  // Laplacian variance
  // Kernel:
  // [ 0,  1,  0 ]
  // [ 1, -4,  1 ]
  // [ 0,  1,  0 ]
  let lapSum = 0;
  let lapSumSq = 0;
  let count = 0;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const center = data[y * w + x];
      const top = data[(y - 1) * w + x];
      const bottom = data[(y + 1) * w + x];
      const left = data[y * w + (x - 1)];
      const right = data[y * w + (x + 1)];
      const val = top + bottom + left + right - 4 * center;
      lapSum += val;
      lapSumSq += val * val;
      count++;
    }
  }

  const lapMean = lapSum / count;
  const lapVar = (lapSumSq / count) - (lapMean * lapMean);

  return {
    width: meta.width,
    height: meta.height,
    format: meta.format,
    meanBrightness: Math.round(meanBrightness * 10) / 10,
    sharpness: Math.round(lapVar * 10) / 10
  };
}

// Hamming distance between two hex hashes (64-bit)
function hammingDistance(h1, h2) {
  let b1 = BigInt('0x' + h1);
  let b2 = BigInt('0x' + h2);
  let x = b1 ^ b2;
  let dist = 0;
  while (x > 0n) {
    if (x & 1n) dist++;
    x >>= 1n;
  }
  return dist;
}

module.exports = {
  computeDHash,
  computeAHash,
  computePHash,
  computeVisualStats,
  hammingDistance
};

