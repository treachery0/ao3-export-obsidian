#!/bin/bash

VAULT_PATH=".sandbox"
PLUGIN_NAME="ao3-export"
PLUGIN_FOLDER="$VAULT_PATH/.obsidian/plugins/$PLUGIN_NAME"
OUTPUT_FOLDER="dist"

# This assumes all necessary files are already in the output folder
mkdir -p $PLUGIN_FOLDER
cp $OUTPUT_FOLDER/* $PLUGIN_FOLDER

# Use the hot reload plugin to avoid having to restart Obsidian after every change
# https://github.com/pjeby/hot-reload
touch $PLUGIN_FOLDER/.hotreload
