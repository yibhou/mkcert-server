#!/bin/bash

# 脚本功能：将 PEM 格式的证书和私钥转换为 JKS 格式的密钥库文件
# 使用 OpenSSL 和 keytool 工具进行转换
# 使用方法：
#   ./scripts/pem-to-jks.sh certs/cert.pem certs/key.pem certs/cert.jks 36aydxn8
# 参数说明：
#   $1: PEM 证书文件路径（如 certificate.pem）
#   $2: 私钥文件路径（如 private.key）
#   $3: 输出的 JKS 文件名（如 keystore.jks）
#   $4: JKS 密码（可选，默认为 "changeit"）

CERT_FILE="$1"
KEY_FILE="$2"
JKS_FILE="$3"
JKS_PASSWORD="${4:-changeit}"
P12_FILE="temp_keystore.p12"
ALIAS="mykey"

# 步骤 1：生成 PKCS#12 文件
openssl pkcs12 -export \
  -in "$CERT_FILE" \
  -inkey "$KEY_FILE" \
  -out "$P12_FILE" \
  -name "$ALIAS" \
  -passout pass:"$JKS_PASSWORD"

# 步骤 2：将 PKCS#12 转换为 JKS
keytool -importkeystore \
  -srckeystore "$P12_FILE" \
  -srcstoretype PKCS12 \
  -destkeystore "$JKS_FILE" \
  -deststoretype JKS \
  -srcstorepass "$JKS_PASSWORD" \
  -deststorepass "$JKS_PASSWORD" \
  -noprompt

# 清理临时文件
rm -f "$P12_FILE"

echo "JKS 文件已生成：$JKS_FILE"
