#!/bin/bash

VAULT_PATH=".sandbox"
PLUGIN_NAME="ao3-export"
PLUGIN_FOLDER="$VAULT_PATH/.obsidian/plugins/$PLUGIN_NAME"
OUTPUT_FOLDER="dist"

cp styles.css $OUTPUT_FOLDER
cp manifest.json $OUTPUT_FOLDER

mkdir -p $PLUGIN_FOLDER
cp $OUTPUT_FOLDER/* $PLUGIN_FOLDER
