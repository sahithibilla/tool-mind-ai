#!/usr/bin/env bash
# Run the TOOLMIND app (backend serves frontend + API).
# From project root: ./run.sh   or   bash run.sh
cd "$(dirname "$0")"
echo "Starting TOOLMIND at http://127.0.0.1:5000"
echo "Open in browser: http://127.0.0.1:5000"
echo ""
python3 backend/app.py
