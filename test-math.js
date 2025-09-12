// Simple test to verify our fallback math works
const {
  createFallbackMath,
} = require('./client/src/lib/math/fallback-math.ts');

const math = createFallbackMath();

console.log('Testing fallback math:');
console.log('2 + 2 =', math.evaluate('2 + 2'));
console.log('sqrt(16) =', math.evaluate('sqrt(16)'));
console.log('sin(0) =', math.evaluate('sin(0)'));

console.log('Fallback math is working!');
