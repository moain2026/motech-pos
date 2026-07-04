#!/bin/bash
# تشغيل golden tests بكلمات السر المدوّرة (من state، ليست بالكود لأسباب أمنية)
CRED=/home/work/.openclaw/workspace/state/motech-pos-credentials.json
export TEST_SUPERVISOR_PASSWORD=$(python3 -c "import json;print(json.load(open('$CRED'))['supervisor1']['password'])")
export TEST_ADMIN_PASSWORD=$(python3 -c "import json;print(json.load(open('$CRED'))['admin']['password'])")
export TEST_CASHIER_PASSWORD=$(python3 -c "import json;print(json.load(open('$CRED'))['cashier1']['password'])")
npm run test:golden
