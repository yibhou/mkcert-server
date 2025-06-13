const acme = require('acme-client');
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const certsDir = path.join(__dirname, '../certs');

if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, {
    recursive: true,
  });
}

const DOMAIN = '';
const EMAIL = '';

const challenges = {};

const app = express();

app.get('/.well-known/acme-challenge/:token', (req, res) => {
  const token = challenges[req.params.token];
  if (!token) {
    return res.status(404).end();
  }
  res.set('Content-Type', 'text/plain');
  res.send(token);
});

app.get('/mkcert', async (req, res) => {
  try {
    await mkcert();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(80, () => {
  console.log('HTTP server running on port 80');
});

async function mkcert() {
  // 创建 ACME 客户端
  const client = new acme.Client({
    directoryUrl:
      process.env.NODE_ENV === 'production'
        ? acme.directory.letsencrypt.production
        : acme.directory.letsencrypt.staging,
    accountKey: await acme.forge.createPrivateKey(),
  });

  // 生成私钥和 CSR
  const [key, csr] = await acme.forge.createCsr({
    commonName: DOMAIN,
  });
  // 自动完成 HTTP-01 验证并申请证书
  const cert = await client.auto({
    csr,
    email: EMAIL,
    termsOfServiceAgreed: true,
    challengeCreateFn: async (authz, challenge, keyAuthorization) => {
      challenges[challenge.token] = keyAuthorization;
      console.log('challenge created', challenge.token);
    },
    challengeRemoveFn: async (authz, challenge, keyAuthorization) => {
      delete challenges[challenge.token];
      console.log('challenge removed', challenge.token);
    },
  });

  fs.writeFileSync(path.join(certsDir, 'cert.pem'), cert);
  fs.writeFileSync(path.join(certsDir, 'key.pem'), key);
  fs.writeFileSync(path.join(certsDir, 'csr.pem'), csr);
  console.log('certificates saved');
}
