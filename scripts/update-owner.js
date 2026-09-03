const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

const db = new DatabaseSync('./data/noleya.db');
const { hash, salt } = hashPassword('FishyBetty');

db.prepare(
  "UPDATE users SET email = 'FishyBetty', username = 'FishyBetty', password_hash = ?, salt = ?, must_change_password = 0, updated_at = datetime('now') WHERE role = 'OWNER' OR id = 1"
).run(hash, salt);

const owner = db.prepare("SELECT id, email, username, name, role, must_change_password FROM users WHERE username = 'FishyBetty'").get();
console.log('SUCCESS: Owner updated:', JSON.stringify(owner, null, 2));
