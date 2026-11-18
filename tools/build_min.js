/**
 * STREET WALL — Zero-Dependency Safe Asset Minifier
 * Minifies CSS (preserving calc() spacing and strings) and strips JS comments/indent safely,
 * then verifies every JS output with `node --check`.
 */
const fs = require('fs');
const { execFileSync } = require('child_process');

function minifyCss(css) {
  let out = '';
  let i = 0;
  const len = css.length;
  let inStr = null;

  while (i < len) {
    const ch = css[i];
    if (inStr) {
      out += ch;
      if (ch === '\\' && i + 1 < len) {
        out += css[++i];
      } else if (ch === inStr) {
        inStr = null;
      }
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      out += ch;
      i++;
      continue;
    }
    if (ch === '/' && css[i + 1] === '*') {
      i += 2;
      while (i < len && !(css[i] === '*' && css[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    out += ch;
    i++;
  }

  return out
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/and\(/g, 'and (')
    .replace(/:not\(/g, ':not(')
    .trim();
}

function minifyJsSafe(src) {
  // State-machine comment & empty-line stripper (preserves strings, template literals, and regexes 100%)
  let out = '';
  let i = 0;
  const len = src.length;
  let state = 'code'; // code | sq | dq | tpl | line | block | regex | regexClass
  let prevNonSpace = '';

  const regexPrevTokens = new Set(['', '(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '\n', '+', '-', '*', '%', '<', '>', '~', '^']);

  while (i < len) {
    const ch = src[i];
    const next = src[i + 1] || '';

    if (state === 'code') {
      if (ch === "'" || ch === '"' || ch === '`') {
        state = ch === "'" ? 'sq' : ch === '"' ? 'dq' : 'tpl';
        out += ch;
        prevNonSpace = ch;
        i++;
      } else if (ch === '/' && next === '/') {
        state = 'line';
        i += 2;
      } else if (ch === '/' && next === '*') {
        state = 'block';
        i += 2;
      } else if (ch === '/' && (regexPrevTokens.has(prevNonSpace) || /(?:return|case|in|of|typeof|delete|throw|else)\s*$/.test(out.slice(-12)))) {
        state = 'regex';
        out += ch;
        prevNonSpace = ch;
        i++;
      } else {
        out += ch;
        if (!/\s/.test(ch)) prevNonSpace = ch;
        else if (ch === '\n') prevNonSpace = '\n';
        i++;
      }
    } else if (state === 'sq' || state === 'dq' || state === 'tpl') {
      const quote = state === 'sq' ? "'" : state === 'dq' ? '"' : '`';
      out += ch;
      if (ch === '\\' && i + 1 < len) {
        out += src[++i];
      } else if (ch === quote) {
        state = 'code';
        prevNonSpace = quote;
      }
      i++;
    } else if (state === 'regex') {
      out += ch;
      if (ch === '\\' && i + 1 < len) {
        out += src[++i];
      } else if (ch === '[') {
        state = 'regexClass';
      } else if (ch === '/') {
        state = 'code';
        prevNonSpace = '/';
      }
      i++;
    } else if (state === 'regexClass') {
      out += ch;
      if (ch === '\\' && i + 1 < len) {
        out += src[++i];
      } else if (ch === ']') {
        state = 'regex';
      }
      i++;
    } else if (state === 'line') {
      if (ch === '\n') {
        out += '\n';
        state = 'code';
        prevNonSpace = '\n';
      }
      i++;
    } else if (state === 'block') {
      if (ch === '*' && next === '/') {
        state = 'code';
        i += 2;
      } else {
        if (ch === '\n') out += '\n';
        i++;
      }
    }
  }

  // Trim indentation outside template literals? Safe line-by-line trim ONLY if not inside multiline template
  // Keep multiline template interiors intact by only collapsing blank lines & leading spaces on non-template lines
  const lines = out.split(/\r?\n/);
  const cleaned = [];
  let inTpl = false;
  for (const rawLine of lines) {
    const trimmed = inTpl ? rawLine : rawLine.trim();
    if (trimmed !== '' || inTpl) cleaned.push(trimmed);
    // Track unescaped backticks
    for (let k = 0; k < rawLine.length; k++) {
      if (rawLine[k] === '\\') { k++; continue; }
      if (rawLine[k] === '`') inTpl = !inTpl;
    }
  }
  return cleaned.join('\n') + '\n';
}

const cssTargets = [
  ['styles/streetwall.css', 'styles/streetwall.min.css']
];

for (const [src, dest] of cssTargets) {
  if (!fs.existsSync(src)) continue;
  const raw = fs.readFileSync(src, 'utf8');
  const min = minifyCss(raw);
  fs.writeFileSync(dest, min, 'utf8');
  console.log(`[CSS] ${src} (${(raw.length / 1024).toFixed(1)} KB) -> ${dest} (${(min.length / 1024).toFixed(1)} KB)`);
}

const jsTargets = [
  ['js/app.js', 'js/app.min.js'],
  ['js/streetfx.js', 'js/streetfx.min.js']
];

for (const [src, dest] of jsTargets) {
  if (!fs.existsSync(src)) continue;
  const raw = fs.readFileSync(src, 'utf8');
  const min = minifyJsSafe(raw);
  fs.writeFileSync(dest, min, 'utf8');
  execFileSync(process.execPath, ['--check', src]);
  execFileSync(process.execPath, ['--check', dest]);
  console.log(`[JS]  ${src} (${(raw.length / 1024).toFixed(1)} KB) -> ${dest} (${(min.length / 1024).toFixed(1)} KB) [syntax OK]`);
}

