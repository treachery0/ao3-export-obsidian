VAULT_PATH="tests"
PLUGIN_NAME="export-ao3"
PLUGIN_FOLDER="$VAULT_PATH/.obsidian/plugins/$PLUGIN_NAME"

mkdir $PLUGIN_FOLDER
cp styles.css $PLUGIN_FOLDER
cp manifest.json $PLUGIN_FOLDER
cp dist/main.js $PLUGIN_FOLDER