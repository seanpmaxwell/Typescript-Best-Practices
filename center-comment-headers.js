import fs from 'fs';
import path from 'path';

/******************************************************************************
                                  Constants
******************************************************************************/

const REGION_START =
  '/******************************************************************************';
const REGION_END =
  '******************************************************************************/';
const EXTENSION = '.ts';
const EXCLUDE_DIRS = new Set(['node_modules', '.git']);

// Matches:
// // ---- TITLE ---- //
const SECTION_REGEX = /^(\s*\/\/\s+)(-+)\s*(.+?)\s*(-+)(\s+\/\/\s*)$/;

/******************************************************************************
                                    Run
******************************************************************************/

/**
 * ChatGPT generated. Center all the section-headers.
 */
walk(process.cwd());

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Recursively walk a directory
 */
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) {
        walk(fullPath);
      }
    } else if (entry.isFile() && fullPath.endsWith(EXTENSION)) {
      centerRegionHeadersInFile(fullPath);
      centerSectionHeadersInFile(fullPath);
    }
  }
}

/**
 * Center region headers in a single file
 */
function centerRegionHeadersInFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const lines = original.split('\n');
  let changed = false;
  for (let i = 0; i < lines.length - 2; i++) {
    const top = lines[i];
    const middle = lines[i + 1];
    const bottom = lines[i + 2];
    if (top.startsWith(REGION_START) && bottom.startsWith(REGION_END)) {
      const width = top.length;
      const title = middle.trim();
      if (!title) continue;
      const leftPadding = Math.floor((width - title.length) / 2);
      const rightPadding = width - title.length - leftPadding;
      const centered =
        ' '.repeat(leftPadding) + title + ' '.repeat(rightPadding);
      if (centered !== middle) {
        lines[i + 1] = centered;
        changed = true;
      }
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

/**
 * Center section headers in a single file
 */
function centerSectionHeadersInFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const lines = original.split('\n');
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(SECTION_REGEX);
    if (!match) continue;
    const [, prefix, leftDashes, title, rightDashes, suffix] = match;
    const totalWidth =
      prefix.length +
      leftDashes.length +
      2 + // spaces around title
      title.length +
      rightDashes.length +
      suffix.length;
    const dashSpace =
      totalWidth - prefix.length - suffix.length - title.length - 2;
    const leftDashCount = Math.floor(dashSpace / 2);
    const rightDashCount = dashSpace - leftDashCount;
    const centered =
      prefix +
      '-'.repeat(leftDashCount) +
      ' ' +
      title +
      ' ' +
      '-'.repeat(rightDashCount) +
      suffix;
    if (centered !== line) {
      lines[i] = centered;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}
