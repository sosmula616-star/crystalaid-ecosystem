// Unified Production Entrypoint for BotHost / Docker / Cloud
const path = require('path');
const fs = require('fs');
const Module = require('module');
const { execSync } = require('child_process');

// 1. Load Root Environment Variables
const rootEnvPath = path.resolve(__dirname, '.env');
if (fs.existsSync(rootEnvPath)) {
  require('dotenv').config({ path: rootEnvPath });
} else {
  require('dotenv').config();
}

// 2. OpenSSL & Alpine Linux (musl) runtime patch for Prisma
if (process.platform === 'linux') {
  try {
    // 2.1 Symlink /usr/lib/libssl.so.3 to /lib/libssl.so.3 if present (Alpine uses /usr/lib)
    const ssl3Paths = ['/usr/lib/libssl.so.3', '/lib64/libssl.so.3'];
    for (const ssl3 of ssl3Paths) {
      if (fs.existsSync(ssl3) && !fs.existsSync('/lib/libssl.so.3')) {
        try { fs.symlinkSync(ssl3, '/lib/libssl.so.3'); } catch (_) {}
      }
    }
    const crypto3Paths = ['/usr/lib/libcrypto.so.3', '/lib64/libcrypto.so.3'];
    for (const crypto3 of crypto3Paths) {
      if (fs.existsSync(crypto3) && !fs.existsSync('/lib/libcrypto.so.3')) {
        try { fs.symlinkSync(crypto3, '/lib/libcrypto.so.3'); } catch (_) {}
      }
    }

    // 2.2 Provide an openssl CLI shim so Prisma's `openssl version -v` check succeeds
    const binDir = path.resolve(__dirname, '.bin');
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }
    const opensslShim = path.join(binDir, 'openssl');
    fs.writeFileSync(opensslShim, '#!/bin/sh\necho "OpenSSL 3.0.8 7 Feb 2023"\n');
    try { fs.chmodSync(opensslShim, 0o755); } catch (_) {}

    process.env.PATH = `${binDir}:${process.env.PATH || ''}`;
  } catch (sslFixErr) {
    console.warn('⚠️ [SSL Fix] Notice during OpenSSL shim setup:', sslFixErr.message);
  }
}

// 3. Monorepo Package Resolution Hook
const originalResolveFilename = Module._resolveFilename;
const aliasMap = {
  '@crystalaid/types': path.resolve(__dirname, 'packages/types/dist/index.js'),
  '@crystalaid/config': path.resolve(__dirname, 'packages/config/dist/index.js'),
  '@crystalaid/database': path.resolve(__dirname, 'packages/database/dist/index.js'),
  '@crystalaid/activity': path.resolve(__dirname, 'apps/activity'),
  '@crystalaid/api': path.resolve(__dirname, 'apps/api/dist/server.js'),
  '@crystalaid/bot': path.resolve(__dirname, 'apps/bot/dist/index.js'),
};

Module._resolveFilename = function (request, parent, isMain, options) {
  if (aliasMap[request]) {
    return aliasMap[request];
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

// 4. Ensure Prisma Client is generated for the current OS/architecture
try {
  const schemaPath = path.resolve(__dirname, 'packages/database/prisma/schema.prisma');
  if (fs.existsSync(schemaPath)) {
    console.log('💎 [Prisma] Validating database client for runtime environment...');
    execSync(`npx prisma generate --schema="${schemaPath}"`, { stdio: 'inherit' });
    console.log('💎 [Prisma] Client generated successfully.');
  }
} catch (err) {
  console.warn('⚠️ [Prisma] Note during generate check:', err.message);
}

// 5. Force Prisma Query Engine Library location on Linux
if (process.platform === 'linux') {
  const searchDirs = [
    path.resolve(__dirname, 'node_modules/.prisma/client'),
    path.resolve(__dirname, 'packages/database/node_modules/.prisma/client'),
  ];
  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;

    const musl3 = path.join(dir, 'libquery_engine-linux-musl-openssl-3.0.x.so.node');
    const debian3 = path.join(dir, 'libquery_engine-debian-openssl-3.0.x.so.node');
    const muslLegacy = path.join(dir, 'libquery_engine-linux-musl.so.node');

    if (fs.existsSync(musl3)) {
      console.log(`💎 [Prisma] Binding PRISMA_QUERY_ENGINE_LIBRARY to musl-openssl-3.0.x: ${musl3}`);
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = musl3;
      // Copy to muslLegacy name as an extra safeguard in case Prisma looks for legacy name
      try {
        if (!fs.existsSync(muslLegacy)) {
          fs.copyFileSync(musl3, muslLegacy);
          console.log(`💎 [Prisma] Aliased ${muslLegacy} -> musl3`);
        }
      } catch (_) {}
      break;
    } else if (fs.existsSync(debian3)) {
      console.log(`💎 [Prisma] Binding PRISMA_QUERY_ENGINE_LIBRARY to debian-openssl-3.0.x: ${debian3}`);
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = debian3;
      break;
    }
  }
}

// 6. Start CrystalAid API + Discord Activity Web Server
console.log('🚀 [CrystalAid] Launching API and Discord Activity Web Server...');
require('./apps/api/dist/server.js');

// 7. Start CrystalAid Discord Bot Gateway (if token is configured)
try {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (botToken && !botToken.includes('placeholder')) {
    console.log('🤖 [CrystalAid] DISCORD_BOT_TOKEN detected. Starting Discord Bot gateway...');
    require('./apps/bot/dist/index.js');
  } else {
    console.log('ℹ️ [CrystalAid] DISCORD_BOT_TOKEN not provided or placeholder. Bot gateway skipped.');
  }
} catch (botErr) {
  console.warn('⚠️ [CrystalAid] Bot gateway encountered an issue:', botErr.message);
}
