import { runMigrations } from '../src/lib/migrations.js';

console.log('Initializing Noléya Marketplace Database...');
try {
  runMigrations();
  console.log('Database initialized successfully.');
  process.exit(0);
} catch (err) {
  console.error('Failed to initialize database:', err);
  process.exit(1);
}
