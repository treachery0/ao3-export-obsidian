#!/bin/bash

VAULT_PATH=".sandbox"
PLUGIN_NAME="html-transformer"
PLUGIN_FOLDER="$VAULT_PATH/.obsidian/plugins/$PLUGIN_NAME"

# copy files to vault
mkdir -p $PLUGIN_FOLDER
cp "dist/main.js" $PLUGIN_FOLDER
cp "manifest.json" $PLUGIN_FOLDER
cp "styles.css" $PLUGIN_FOLDER

# Use the hot reload plugin to avoid having to restart Obsidian after every change
# https://github.com/pjeby/hot-reload
touch $PLUGIN_FOLDER/.hotreload
