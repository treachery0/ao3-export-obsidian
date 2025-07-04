import { App, PluginSettingTab, Setting } from "obsidian";
import AO3ExportPlugin from "./main";

export interface AO3ExportSettings {
    removedAttributes: string[]
    removedSelectors: string[]
    includeHeadingElement: boolean
}

export function getDefaultSettings(): AO3ExportSettings {
    return {
        removedAttributes: [
            'data-heading',
            'dir'
        ],
        removedSelectors: [
            ':has(.internal-embed)'
        ],
        includeHeadingElement: true
    };
}

export class AO3ExportSettingTab extends PluginSettingTab {
    plugin: AO3ExportPlugin;

    constructor(app: App, plugin: AO3ExportPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const container = this.containerEl;

        container.empty();

        this.displayList(
            this.plugin.settings.removedSelectors,
            'Excluded elements',
            'Any element matching at least one of these CSS selectors will be removed from exported content',
            'CSS selector',
            'Add new selector'
        );

        this.displayList(
            this.plugin.settings.removedAttributes,
            'Excluded attributes',
            'Any HTML attribute in this list will be removed from exported content',
            'Attribute name',
            'Add new attribute'
        );

        new Setting(container)
            .setName('Options')
            .setHeading()

        new Setting(container)
            .setName('Heading titles')
            .setDesc('Include the heading element in the copied content')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeHeadingElement)
                .onChange(async (value) => {
                    this.plugin.settings.includeHeadingElement = value;
                    await this.saveSettings(false);
                }))

        new Setting(container)
            .setName('Reset settings')
            .setDesc('Set all plugin settings to their default values')
            .addButton(button => button
                .setButtonText('Reset')
                .setWarning()
                .onClick(async () => {
                    this.plugin.settings = getDefaultSettings();
                    await this.saveSettings(true);
                }))
    }

    displayList(collection: string[], title: string, description: string, elementPlaceholder: string, addLabel: string) {
        const container = this.containerEl;

        new Setting(container)
            .setName(title)
            .setDesc(description)
            .setHeading();

        for(let i = 0; i < collection.length; i++){
            new Setting(container)
                .setClass('setting-list-item')
                .addText(text => text
                    .setPlaceholder(elementPlaceholder)
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
                .setButtonText(addLabel)
                .onClick(async () => {
                    collection.push('');
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