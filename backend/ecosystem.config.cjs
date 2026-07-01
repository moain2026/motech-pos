/**
 * pm2 process definition for the Motech POS backend (NestJS, Oracle-first).
 *
 * Durable service: pm2 keeps it alive across crashes and (with `pm2 save` +
 * `pm2 startup`) across reboots. Loads the local .env, then overrides PORT to
 * 3100 (the port Caddy reverse-proxies /api, /auth, /health to) and widens
 * CORS to include the public domain.
 *
 * Start:   pm2 start ecosystem.config.cjs && pm2 save
 * Logs:    pm2 logs motech-pos-api
 */
require('dotenv').config({ path: __dirname + '/.env' });

module.exports = {
  apps: [
    {
      name: 'motech-pos-api',
      cwd: __dirname,
      script: 'dist/main.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 20,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '3100',
        CORS_ORIGINS:
          'http://localhost:5173,https://nuugneol.gensparkclaw.com',
      },
    },
  ],
};
