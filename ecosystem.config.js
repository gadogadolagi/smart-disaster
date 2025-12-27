const path = require("path");

module.exports = {
  apps: [
    {
      name: "web",
      cwd: "./apps/web",
      script: "npm",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/web-error.log",
      out_file: "./logs/web-out.log",
      log_file: "./logs/web-combined.log",
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      merge_logs: true,
      kill_timeout: 5000,
    },
    {
      name: "api",
      cwd: "./apps/api",
      script: "node",
      args: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
      log_file: "./logs/api-combined.log",
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      merge_logs: true,
      kill_timeout: 5000,
      // Wait for build to complete before starting
      wait_ready: false,
    },
    {
      name: "service-ai",
      cwd: path.resolve(__dirname, "apps/service-ai"),
      // Menggunakan path absolut ke Python interpreter di virtual environment
      script: path.resolve(__dirname, "apps/service-ai/venv/bin/python"),
      args: "main.py",
      // Alternatif: Jika path absolut tidak bekerja, gunakan script wrapper:
      // script: path.resolve(__dirname, 'apps/service-ai/pm2-start.sh'),
      // interpreter: 'bash',
      instances: 1,
      exec_mode: "fork",
      env: {
        PYTHONUNBUFFERED: "1",
        PORT: 8000,
      },
      error_file: path.resolve(
        __dirname,
        "apps/service-ai/logs/service-ai-error.log"
      ),
      out_file: path.resolve(
        __dirname,
        "apps/service-ai/logs/service-ai-out.log"
      ),
      log_file: path.resolve(
        __dirname,
        "apps/service-ai/logs/service-ai-combined.log"
      ),
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      merge_logs: true,
      kill_timeout: 5000,
    },
  ],
};
