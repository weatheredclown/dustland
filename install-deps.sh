#!/bin/sh
set -e
apt-get update
apt-get install -y \
  libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
  libgbm1 libnss3 libxshmfence1 libxkbcommon0

if ! apt-get install -y libasound2 2>/dev/null; then
  apt-get install -y libasound2t64
fi
