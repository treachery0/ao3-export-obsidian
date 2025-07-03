VAULT_PATH="tests"
PLUGIN_NAME="ao3-export"
PLUGIN_FOLDER="$VAULT_PATH/.obsidian/plugins/$PLUGIN_NAME"

mkdir $PLUGIN_FOLDER
cp styles.css $PLUGIN_FOLDER
cp manifest.json $PLUGIN_FOLDER
cp dist/main.js $PLUGIN_FOLDER