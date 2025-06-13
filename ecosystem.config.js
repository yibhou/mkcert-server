module.exports = {
  apps: [
    {
      name: 'mkcert-server',
      script: 'src/index.js',
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      time: true,
    },
  ],
};
