import { App, Modal, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { renderCurrentDocument, cleanDocument, trimToSection, trimToSummary, trimToTags } from "./utils";

interface AO3ExportSettings {
    sectionElements: string
    tagsSectionName: string
}

const DEFAULT_SETTINGS: AO3ExportSettings = {
    sectionElements: 'h2',
    tagsSectionName: 'tags'
}

export default class AO3ExportPlugin extends Plugin {
    settings: AO3ExportSettings;

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new AO3ExportSettingTab(this.app, this));

        this.addCommand({
            id: 'ao3-export-note',
            name: 'Manage current document',
            callback: () => {
                if(!this.app.workspace.getActiveFile()) {
                    new Notice('No active note to export');
                    return;
                }

                new AO3ExportModal(this.app).open();
            }
        });
    }
}

class AO3ExportModal extends Modal {
    constructor(app: App) {
        super(app);

        this.setTitle('Export note for AO3');

        new Setting(this.contentEl)
            .setName('Entire note')
            .addButton(button => {
                button.setButtonText('Copy');
                button.onClick(async () => this.exportNote());
            });

        new Setting(this.contentEl)
            .setName('Summary')
            .addButton(button => {
                button.setButtonText('Copy');
                button.onClick(async () => this.exportSummary());
            });

        new Setting(this.contentEl)
            .setName('Tag list')
            .addButton(button => {
                button.setButtonText('Copy');
                button.onClick(async () => this.exportTagList());
            });

        new Setting(this.contentEl)
            .setName('Story')
            .addButton(button => {
                button.setButtonText('Copy');
                button.onClick(async () => this.exportStory());
            });
    }

    async exportNote(options?: AO3ExportTaskOptions) {
        const element = await renderCurrentDocument(this.app);

        if(!element) {
            return;
        }

        if(options?.before) {
            const success = options.before(element);

            if(!success) {
                return;
            }
        }

        cleanDocument(element);

        if(options?.after) {
            const success = options.after(element);

            if(!success) {
                return;
            }
        }

        const content = options?.stringify ? options.stringify(element) : element.innerHTML.trim();

        await navigator.clipboard.writeText(content);

        new Notice(`Copied ${content.length} characters to the clipboard!`);
    }

    async exportSummary() {
        await this.exportNote({
            before: element => {
                const success = trimToSummary(element);

                if(!success) {
                    new Notice('No summary could be located');
                }

                return success;
            }
        });
    }

    async exportTagList() {
        await this.exportNote({
            before: element => {
                const success = trimToTags(element, 'tags', 'h2');

                if(!success) {
                    new Notice('No tag list could be located');
                }

                return success;
            },
            stringify: element => element.innerText
        });
    }

    async exportStory() {
        await this.exportNote({
            before: element => {
                const success = trimToSection(element, 'story', 'h2')

                if(!success) {
                    new Notice(`No story section could be located`);
                }

                return success;
            }
        });
    }
}

interface AO3ExportTaskOptions {
    before?: (element: HTMLElement) => boolean
    after?: (element: HTMLElement) => boolean
    stringify?: (element: HTMLElement) => string
}

class AO3ExportSettingTab extends PluginSettingTab {
    plugin: AO3ExportPlugin;

    constructor(app: App, plugin: AO3ExportPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Section element')
            .setDesc('Elements with this tag will be checked when searching for sections')
            .addText(text => text
                .setPlaceholder('Element tag')
                .setValue(this.plugin.settings.sectionElements)
                .onChange(async (value) => {
                    this.plugin.settings.sectionElements = value;
                    await this.plugin.saveSettings();
                }));
    }
}