import { test } from 'node:test';
import assert from 'node:assert';
import {
  getRequiredXpForLevel,
  calculateLevelProgression,
  APP_CONFIG,
} from '../src/index';

test('Level Progression Formula', () => {
  assert.strictEqual(getRequiredXpForLevel(1), 0);
  assert(getRequiredXpForLevel(2) > 0);
  assert(getRequiredXpForLevel(10) > getRequiredXpForLevel(5));
});

test('XP to Level Calculation', () => {
  const p1 = calculateLevelProgression(0);
  assert.strictEqual(p1.level, 1);
  assert.strictEqual(p1.progressPercent, 0);

  const xpLvl2 = getRequiredXpForLevel(2);
  const p2 = calculateLevelProgression(xpLvl2);
  assert.strictEqual(p2.level, 2);

  const pHigh = calculateLevelProgression(50000);
  assert(pHigh.level > 10);
  assert(pHigh.progressPercent >= 0 && pHigh.progressPercent <= 100);
});

test('Anti-Cheat Clamps & Cooldowns Config', () => {
  assert.strictEqual(APP_CONFIG.dailyClaimCooldownHours, 20);
  assert.strictEqual(APP_CONFIG.streakMaxGracePeriodHours, 48);
  assert(APP_CONFIG.antiCheat.maxAllowedXpPerMinute >= 60);
  assert.strictEqual(APP_CONFIG.antiCheat.minHeartbeatIntervalSeconds, 15);
});
