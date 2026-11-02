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

// 2. Monorepo Package Resolution Hook
// Ensures that @crystalaid/* packages are resolved even if npm workspaces were not symlinked in production
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

// 3. Ensure Prisma Client is generated for the current OS/architecture
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

// 4. Start CrystalAid API + Discord Activity Web Server
console.log('🚀 [CrystalAid] Launching API and Discord Activity Web Server...');
require('./apps/api/dist/server.js');

// 5. Start CrystalAid Discord Bot Gateway (if token is configured)
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
