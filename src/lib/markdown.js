'use strict';

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(process.cwd(), 'content', 'segments');

/**
 * Minimal frontmatter parser — intentionally dependency-free.
 * Supports flat key: value pairs plus [a, b, c] arrays. That's all
 * this project's schema needs, and it keeps `npm install` to just
 * next/react for a faster, more reliable Vercel build.
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw.trim() };

  const [, fmBlock, body] = match;
  const data = {};

  for (const line of fmBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();

    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim();
      data[key] = inner === ''
        ? []
        : inner.split(',').map((v) => coerce(v.trim()));
    } else {
      data[key] = coerce(value);
    }
  }

  return { data, body: body.trim() };
}

function coerce(value) {
  const unquoted = value.replace(/^["']|["']$/g, '');
  if (unquoted === 'true') return true;
  if (unquoted === 'false') return false;
  if (unquoted !== '' && !Number.isNaN(Number(unquoted))) return Number(unquoted);
  return unquoted;
}

function getAllSegments() {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    const { data, body } = parseFrontmatter(raw);
    return { ...data, id: data.id || file.replace(/\.md$/, ''), description: body };
  });
}

function getSegmentById(id) {
  return getAllSegments().find((s) => s.id === id) || null;
}

module.exports = { getAllSegments, getSegmentById, parseFrontmatter };
