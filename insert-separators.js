/* eslint-disable no-undef */

import fs from 'fs';
import path from 'path';

// ========================================================================= //
//                                  Constants                                //
// ========================================================================= //

const TOTAL_LEN = 79;
const SOURCE_DIRECTORIES = ['./'];

const PaddingParams = {
  Js: {
    FILE_EXT: /\.(ts|tsx|js|jsx)$/,
    REGION_MARKER: /^\s*\/\/ r~~ (.+)/,
    SECTION_MARKER: /^\s*\/\/ s~~ (.+)/,
    BOOKENDS: ['// ', ' //'],
  },
  Css: {
    FILE_EXT: /\.(css|scss)$/,
    REGION_MARKER: /^\s*\/\* r~~ (.+?) \*\/\s*$/,
    SECTION_MARKER: /^\s*\/\* s~~ (.+?) \*\/\s*$/,
    BOOKENDS: ['/* ', ' */'],
  },
};

// ========================================================================= //
//                                     Run                                   //
// ========================================================================= //

SOURCE_DIRECTORIES.forEach((srcDir) => {
  processDirectory(srcDir, PaddingParams.Js);
  processDirectory(srcDir, PaddingParams.Css);
});

// ========================================================================= //
//                                  Functions                                //
// ========================================================================= //

/**
 * Process directory
 */
function processDirectory(dir, paddingType) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath, paddingType);
    } else if (paddingType.FILE_EXT.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const updated = formatHeaders(content, paddingType);
      if (updated !== content) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

/**
 * Format header markers so the label is centered and the result is exactly
 * 79 characters wide. Two kinds are supported:
 *
 * Region ("// r~~ someText") -> a 3-line block:
 *
 * // ====================================================================== //
 * //                                  someText                              //
 * // ====================================================================== //
 *
 * Section ("// s~~ someText") -> a single line:
 *
 * // ==================== someText ===================== //
 */
function formatHeaders(text, paddingType) {
  return text.split('\n').map(line => {
    const indent = line.match(/^(\s*)/)[1];
    const sectionMatch = line.match(paddingType.SECTION_MARKER);
    if (sectionMatch) {
      return formatSection(sectionMatch[1]?.trim() ?? '', paddingType, indent);
    }
    const regionMatch = line.match(paddingType.REGION_MARKER);
    if (regionMatch) {
      return formatRegion(regionMatch[1]?.trim() ?? '', paddingType, indent);
    }
    return line;
  }).join('\n');
}

/**
 * Build a single-line section header centered within `[open] = label = [close]`.
 */
function formatSection(label, paddingType, indent) {
  const [open, close] = paddingType.BOOKENDS;
  const lineLen = TOTAL_LEN - indent.length;
  const available = lineLen - open.length - close.length - label.length - 2;
  const left = Math.max(Math.ceil(available / 2), 0);
  const right = Math.max(Math.floor(available / 2), 0);
  return `${indent}${open}${'='.repeat(left)} ${label} ${'='.repeat(right)}${close}`;
}

/**
 * Build a 3-line region header block with the label centered on the middle line.
 * Each line is exactly 79 characters: "[open]" + content + "[close]"
 */
function formatRegion(label, paddingType, indent) {
  const [open, close] = paddingType.BOOKENDS;
  const lineLen = TOTAL_LEN - indent.length;
  const inner = lineLen - open.length - close.length;
  const rule = indent + open + '='.repeat(inner) + close;
  const leftPad = Math.max(Math.floor((inner - label.length) / 2), 0);
  const rightPad = Math.max(inner - label.length - leftPad, 0);
  const middle = indent + open + ' '.repeat(leftPad) + label + ' '.repeat(rightPad) + close;
  return [rule, middle, rule].join('\n');
}