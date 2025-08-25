#!/bin/sh
set -e
if ! apt-get update 2>&1 | tee /tmp/apt-update.log; then
  update_status=$?
else
  update_status=0
fi
if grep -q "mise.jdx.dev" /tmp/apt-update.log; then
  echo "mise.jdx.dev repo unreachable; disabling and retrying..."
  grep -Rl "mise.jdx.dev" /etc/apt/sources.list /etc/apt/sources.list.d 2>/dev/null | \
    xargs -r sed -i.bak '/mise\.jdx\.dev/s/^/#/'
  apt-get update
elif [ "$update_status" -ne 0 ]; then
  echo "apt-get update failed"
  exit 1
fi
rm /tmp/apt-update.log

apt-get install -y \
  libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
  libgbm1 libnss3 libxshmfence1 libxkbcommon0

if ! apt-get install -y libasound2 2>/dev/null; then
  apt-get install -y libasound2t64
fi
