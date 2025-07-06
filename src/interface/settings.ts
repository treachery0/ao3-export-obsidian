import { App, PluginSettingTab, Setting } from "obsidian";
import HtmlTransformerPlugin from "../main";
import { HtmlTransformerSettings } from "../models/HtmlTransformerSettings";

class HtmlTransformerSettingTab extends PluginSettingTab {
    plugin: HtmlTransformerPlugin;

    constructor(app: App, plugin: HtmlTransformerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const container = this.containerEl;

        container.empty();

        this.displayList(
            this.plugin.settings.globalExcludedSelectors,
            'Globally excluded elements',
            'Any HTML element matched by a CSS selector is always removed from exported content',
            'CSS selector',
            'New selector'
        );

        this.displayList(
            this.plugin.settings.globalExcludedAttributes,
            'Globally excluded attributes',
            'Any HTML attribute in this list is always removed from exported content',
            'Attribute name',
            'New attribute'
        );

        new Setting(container)
            .setName('Options')
            .setHeading();

        new Setting(container)
            .setName('Heading titles')
            .setDesc('Include the heading element in the copied content')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeHeadingElement)
                .onChange(async (value) => {
                    this.plugin.settings.includeHeadingElement = value;
                    await this.saveSettings(false);
                })
            );

        new Setting(container)
            .setName('Danger zone')
            .setHeading();

        new Setting(container)
            .setName('Reset settings')
            .setDesc('Set plugin settings to their default values')
            .addButton(button => button
                .setButtonText('Reset')
                .setWarning()
                .onClick(async () => {
                    this.plugin.settings = getDefaultSettings();
                    await this.saveSettings(true);
                })
            );
    }

    displayList(collection: string[], name: string, description: string, placeholder: string, buttonLabel: string, defaultValue: string = '') {
        const container = this.containerEl;

        new Setting(container)
            .setName(name)
            .setDesc(description)
            .setHeading();

        for(let i = 0; i < collection.length; i++) {
            new Setting(container)
                .setClass('setting-list-item')
                .addText(text => text
                    .setPlaceholder(placeholder)
                    .setValue(collection[i])
                    .onChange(async (value) => {
                        collection[i] = value;
                        await this.saveSettings(false);
                    }))
                .addButton(button => button
                    .setIcon('trash-2')
                    .onClick(async () => {
                        collection.splice(i, 1);
                        await this.saveSettings(true);
                    }));
        }

        new Setting(container)
            .setClass('setting-list-add')
            .addButton(button => button
                .setButtonText(buttonLabel)
                .onClick(async () => {
                    collection.push(defaultValue);
                    await this.saveSettings(true);
                }));
    }

    async saveSettings(refresh: boolean) {
        await this.plugin.saveSettings();

        if(refresh) {
            this.display();
        }
    }
}

export function createSettingsTab(plugin: HtmlTransformerPlugin): PluginSettingTab {
    return new HtmlTransformerSettingTab(plugin.app, plugin);
}

export function getDefaultSettings(): HtmlTransformerSettings {
    return {
        globalTransform: true,
        globalExcludedAttributes: ['data-heading', 'dir'],
        globalExcludedSelectors: [':has(.internal-embed)'],
        includeHeadingElement: true
    };
}
