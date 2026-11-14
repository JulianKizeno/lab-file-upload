const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function setup() {
  const strategies = {}; let queries = 0;
  const mocks = {
    passport: { serializeUser() {}, deserializeUser() {}, use(name, value) { strategies[name] = value; }, initialize() {}, session() {} },
    'passport-local': { Strategy: function (...args) { this.verify = args.at(-1); } },
    '../models/User.model': { findOne() { queries++; return Promise.resolve(null); } },
    bcryptjs: { compare() { throw new Error('Must not compare without a user'); } },
    'express-session': () => () => {}, 'connect-mongo': () => function () {}, mongoose: { connection: {} }
  };
  const context = { module: { exports: {} }, require: name => { if (!(name in mocks)) throw new Error(name); return mocks[name]; }, process: { env: {} } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../configs/passport.config.js'), 'utf8'), context);
  return { strategies, context, queries: () => queries };
}
test('login/signup reject operator objects before querying or hashing', () => {
  const { strategies, queries } = setup();
  for (const value of [{ $ne: null }, ['admin'], 123]) {
    let called = 0;
    strategies['local-login'].verify(value, 'password', (error, user) => { assert.equal(user, false); called++; });
    strategies['local-signup'].verify({ body: { email: 'test@example.invalid' } }, 'admin', value, (error, user) => { assert.equal(user, false); called++; });
    assert.equal(called, 2);
  }
  assert.equal(queries(), 0);
});
test('missing user rejects exactly once without dereferencing its password', async () => {
  const { strategies } = setup(); let called = 0;
  strategies['local-login'].verify('missing', 'password', (error, user) => { assert.equal(error, null); assert.equal(user, false); called++; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(called, 1);
});
test('a missing session secret prevents startup', () => {
  const { context } = setup();
  assert.throws(() => context.module.exports({ use() {} }), /SESSION_SECRET/);
});
