#!/usr/bin/env node
/**
 * Migrate a doctor's local images to Cloudinary and update all code references.
 *
 * Workflow:
 *   1. Design your page freely using local images (e.g., assets/images/sachin/...)
 *   2. When done, run this script:
 *
 *      node scripts/migrate-to-cloudinary.js <doctor-slug>
 *
 *   Example:
 *      node scripts/migrate-to-cloudinary.js sachin
 *
 *   What it does:
 *     - Scans all .html, .ts, .scss files under src/ for local asset references
 *     - Uploads each referenced image to Cloudinary (knocdoc/<slug>/...)
 *     - Replaces every local path in the code with the Cloudinary URL
 *     - Prints a summary of what changed
 *
 *   Environment variables:
 *     CLOUDINARY_CLOUD_NAME  (required)
 *     CLOUDINARY_API_KEY     (required)
 *     CLOUDINARY_API_SECRET  (required)
 *
 *   Options:
 *     --dry-run    Show what would be uploaded/replaced without making changes
 *     --no-delete  Keep local image files after migration (default: deletes them)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// --- Config ---
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

const args = process.argv.slice(2);
const flags = args.filter(a => a.startsWith('--'));
const positional = args.filter(a => !a.startsWith('--'));
const DOCTOR_SLUG = positional[0];
const DRY_RUN = flags.includes('--dry-run');
const KEEP_FILES = flags.includes('--no-delete');

if (!DOCTOR_SLUG) {
  console.error('Usage: node scripts/migrate-to-cloudinary.js <doctor-slug> [--dry-run] [--no-delete]');
  console.error('Example: node scripts/migrate-to-cloudinary.js sachin');
  process.exit(1);
}

if (!DRY_RUN && (!CLOUD_NAME || !API_KEY || !API_SECRET)) {
  console.error('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  process.exit(1);
}

const SRC_DIR = path.resolve(__dirname, '..', 'src');
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

// --- Step 1: Find all source files ---
function walkDir(dir, exts) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.angular') continue;
      results = results.concat(walkDir(full, exts));
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

// --- Step 2: Extract local asset references ---
function findAssetRefs(fileContent) {
  // Matches: assets/images/..., assets/icons/..., assets/videoes/...
  // In src="...", [src]="'...'", url('...'), or plain string '...' / "..."
  const pattern = /(?:assets\/(?:images|icons|videoes)\/[^\s"'`)\]]+)/g;
  const matches = [];
  let m;
  while ((m = pattern.exec(fileContent)) !== null) {
    matches.push(m[0]);
  }
  return [...new Set(matches)];
}

// --- Step 3: Derive Cloudinary public ID from local path ---
function toPublicId(localPath) {
  // assets/images/sachin/team/priya.jpg -> knocdoc/sachin/team/priya
  // assets/icons/knocdocLogoWB.png      -> knocdoc/shared/knocdoc-logo-wb
  let rel = localPath
    .replace(/^assets\/images\//, '')
    .replace(/^assets\/icons\//, 'shared/')
    .replace(/^assets\/videoes\//, '');

  // Remove file extension
  rel = rel.replace(/\.[^.]+$/, '');

  // Clean up: lowercase, spaces to hyphens
  rel = rel.toLowerCase().replace(/\s+/g, '-');

  return `knocdoc/${rel}`;
}

// --- Step 4: Upload to Cloudinary ---
function uploadToCloudinary(filePath, publicId) {
  return new Promise((resolve, reject) => {
    const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
    const fileData = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const fields = [
      { name: 'public_id', value: publicId },
      { name: 'overwrite', value: 'true' },
      { name: 'resource_type', value: 'image' },
    ];

    let body = Buffer.alloc(0);
    for (const field of fields) {
      const part = `--${boundary}\r\nContent-Disposition: form-data; name="${field.name}"\r\n\r\n${field.value}\r\n`;
      body = Buffer.concat([body, Buffer.from(part)]);
    }

    // File field
    const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`;
    const fileFooter = `\r\n--${boundary}--\r\n`;
    body = Buffer.concat([body, Buffer.from(fileHeader), fileData, Buffer.from(fileFooter)]);

    const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUD_NAME}/image/upload`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        'Authorization': `Basic ${auth}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// --- Step 5: Build Cloudinary URL ---
function buildCloudinaryUrl(publicId) {
  return `${BASE_URL}/f_auto,q_auto/${publicId}`;
}

// --- Main ---
async function main() {
  console.log(`\n=== Migrate images to Cloudinary: ${DOCTOR_SLUG} ===`);
  if (DRY_RUN) console.log('    (DRY RUN — no uploads or file changes)\n');
  else console.log('');

  // 1. Scan source files
  const sourceFiles = walkDir(SRC_DIR, ['.html', '.ts', '.scss', '.json']);
  console.log(`Scanning ${sourceFiles.length} source files...\n`);

  // 2. Collect all unique local asset paths across the project
  const refsByFile = new Map(); // file -> [localPaths]
  const allLocalPaths = new Set();

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const refs = findAssetRefs(content);
    if (refs.length > 0) {
      refsByFile.set(file, refs);
      refs.forEach(r => allLocalPaths.add(r));
    }
  }

  if (allLocalPaths.size === 0) {
    console.log('No local asset references found. Nothing to migrate.');
    return;
  }

  // 3. Check which files exist on disk
  const mapping = new Map(); // localPath -> cloudinaryUrl
  const toUpload = [];
  const missing = [];

  for (const localPath of allLocalPaths) {
    const diskPath = path.join(SRC_DIR, localPath);
    if (fs.existsSync(diskPath)) {
      const publicId = toPublicId(localPath);
      toUpload.push({ localPath, diskPath, publicId });
    } else {
      missing.push(localPath);
    }
  }

  console.log(`Found ${allLocalPaths.size} unique asset references:`);
  console.log(`  ${toUpload.length} files exist on disk (will upload)`);
  if (missing.length > 0) {
    console.log(`  ${missing.length} files missing (will skip):`);
    missing.forEach(m => console.log(`    - ${m}`));
  }
  console.log('');

  // 4. Upload
  console.log('Uploading to Cloudinary:\n');
  for (const item of toUpload) {
    const url = buildCloudinaryUrl(item.publicId);
    if (DRY_RUN) {
      console.log(`  [DRY] ${item.localPath} -> ${item.publicId}`);
    } else {
      process.stdout.write(`  ${item.localPath} -> ${item.publicId} ... `);
      try {
        await uploadToCloudinary(item.diskPath, item.publicId);
        console.log('OK');
      } catch (err) {
        console.log(`FAILED: ${err.message.slice(0, 100)}`);
      }
    }
    mapping.set(item.localPath, url);
  }

  // 5. Replace references in source files
  console.log('\nUpdating source files:\n');
  let filesChanged = 0;

  for (const [file, refs] of refsByFile) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    for (const ref of refs) {
      const cloudUrl = mapping.get(ref);
      if (!cloudUrl) continue;

      // Replace all occurrences of this local path
      const escaped = ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      const newContent = content.replace(regex, cloudUrl);
      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
    }

    if (changed) {
      const relPath = path.relative(path.resolve(__dirname, '..'), file);
      if (DRY_RUN) {
        console.log(`  [DRY] Would update: ${relPath}`);
      } else {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`  Updated: ${relPath}`);
      }
      filesChanged++;
    }
  }

  // 6. Optionally delete local files
  if (!DRY_RUN && !KEEP_FILES && toUpload.length > 0) {
    console.log('\nCleaning up local files:\n');
    for (const item of toUpload) {
      try {
        fs.unlinkSync(item.diskPath);
        console.log(`  Deleted: ${item.localPath}`);
      } catch (e) {
        console.log(`  Could not delete: ${item.localPath}`);
      }
    }
  }

  // 7. Summary
  console.log(`\n=== Summary ===`);
  console.log(`  Images uploaded:  ${toUpload.length}`);
  console.log(`  Files updated:    ${filesChanged}`);
  console.log(`  Missing (skipped): ${missing.length}`);
  if (!DRY_RUN) {
    console.log(`\n  Verify: ${BASE_URL}/f_auto,q_auto,w_300/knocdoc/${DOCTOR_SLUG}/hero/profile`);
  }
  console.log('');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
