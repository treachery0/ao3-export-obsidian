import { Plugin } from "obsidian";
import { HtmlTransformerSettings } from "./models/HtmlTransformerSettings";
import { extendContextMenu } from "./interface/menu";
import { getDefaultSettings, createSettingsTab } from "./interface/settings";

export default class HtmlTransformerPlugin extends Plugin {
    settings: HtmlTransformerSettings;

    async loadSettings() {
        this.settings = Object.assign({}, getDefaultSettings(), await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async onload() {
        await this.loadSettings();

        this.addSettingTab(
            createSettingsTab(this)
        );

        this.registerEvent(
            this.app.workspace.on('editor-menu', (menu, editor, view) => extendContextMenu(menu, editor, view, this.settings))
        );
    }
}
