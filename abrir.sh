#!/bin/bash
# Abrir OLYMPUS BILL
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

gnome-terminal --title="OLYMPUS BILL" -- bash -c "npm run dev; exec bash"
