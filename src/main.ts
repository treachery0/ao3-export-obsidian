import { App, Menu, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { renderCurrentDocument, trimChildren } from "./utils";

interface AO3ExportSettings {
    sectionElements: string
    storySectionName: string
    tagsSectionName: string
}

const DEFAULT_SETTINGS: AO3ExportSettings = {
    sectionElements: 'h2',
    storySectionName: 'story',
    tagsSectionName: 'tags'
}

export default class AO3ExportPlugin extends Plugin {
    settings: AO3ExportSettings;

    async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    async onload(): Promise<void> {
        // load settings
        await this.loadSettings();

        // add ribbon to open export modal
        this.addRibbonIcon('file-down', 'AO3 Export', (event: MouseEvent): void => {
            const menu = new Menu();

            menu.addItem(item => item
                .setTitle('Export options')
                .setIsLabel(true)
            );

            menu.addItem(item => item
                .setTitle('Entire document')
                .setIcon('document')
                .onClick(() => this.copyDocument())
            );

            menu.addItem(item => item
                .setTitle('Summary')
                .setIcon('sigma')
                .onClick(() => this.copyDocument(container => this.trimToSummary(container)))
            );

            menu.addItem(item => item
                .setTitle('Story')
                .setIcon('align-left')
                .onClick(() => this.copyDocument(container => this.trimToStory(container)))
            );

            menu.addItem(item => item
                .setTitle('Tags')
                .setIcon('tags')
                .onClick(() => this.copyDocument(container => this.trimToTags(container), container => this.getTagList(container)))
            );

            menu.showAtMouseEvent(event);
        });

        // add a settings tab
        this.addSettingTab(new ExportSettingTab(this.app, this));
    }

    async copyDocument(preprocessor?: (container: HTMLElement) => boolean, postprocessor?: (container: HTMLElement) => string): Promise<void> {
        const container = await renderCurrentDocument(this.app);

        if(!container) {
            new Notice('No active note to export');
            return;
        }

        if(preprocessor) {
            const success = preprocessor(container);

            if(!success) {
                return;
            }
        }

        this.processDocument(container);

        const content = postprocessor ? postprocessor(container) : container.innerHTML.trim();

        await navigator.clipboard.writeText(content);

        new Notice(`Copied ${content.length} characters to the clipboard!`);
    }

    processDocument(container: HTMLElement): void {
        for(let i = 0; i < container.childElementCount; i++) {
            const child = container.children[i];

            // remove if internal embed
            if(child.find('.internal-embed[alt^="^S"]')) {
                container.removeChild(child);
                i--;

                continue;
            }

            // remove all attributes
            while(child.attributes.length > 0) {
                child.removeAttribute(child.attributes[0].name);
            }
        }
    }

    trimToSummary(container: HTMLElement): boolean {
        let endIndex = -1;

        for(let i = 0; i < container.childElementCount; i++) {
            const child = container.children[i] as HTMLElement;

            if(child.localName !== 'p' || child.find('a.tag')) {
                endIndex = i - 1;
                break;
            }
        }

        if(endIndex < 0) {
            new Notice('No summary section could be identified');
            return false;
        }

        trimChildren(container, 0, endIndex);

        return true;
    }

    trimToStory(container: HTMLElement): boolean {
        let startIndex = -1;
        let endIndex = -1;

        for(let i = 0; i < container.childElementCount; i++) {
            const child = container.children[i] as HTMLElement;

            if(child.localName !== this.settings.sectionElements) {
                continue;
            }

            if(startIndex >= 0) {
                endIndex = i - 1;
                break;
            }

            if(child.dataset.heading?.toLowerCase() === this.settings.storySectionName) {
                startIndex = i + 1;
            }
        }

        if(startIndex < 0) {
            new Notice('No story section could be identified');
            return false;
        }

        if(endIndex < 0) {
            endIndex = container.childElementCount;
        }

        trimChildren(container, startIndex, endIndex);

        return true;
    }

    trimToTags(container: HTMLElement): boolean {
        let startIndex = -1;
        let endIndex = -1;

        for(let i = 0; i < container.childElementCount; i++) {
            const child = container.children[i] as HTMLElement;

            if(child.localName !== this.settings.sectionElements) {
                continue;
            }

            if(startIndex >= 0) {
                endIndex = i - 1;
                break;
            }

            if(child.dataset.heading?.toLowerCase() === this.settings.tagsSectionName) {
                startIndex = i + 1;
            }
        }

        if(startIndex < 0) {
            new Notice('No tags section could be identified');
            return false;
        }

        if(endIndex < 0) {
            endIndex = container.childElementCount;
        }

        trimChildren(container, startIndex, endIndex);

        container.innerText = container
            .findAll('li')
            .map(element => element.innerText)
            .join(', ');

        return true;
    }

    getTagList(container: HTMLElement): string {
        return container.innerText;
    }
}

class ExportSettingTab extends PluginSettingTab {
    plugin: AO3ExportPlugin;

    constructor(app: App, plugin: AO3ExportPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Story section name')
            .setDesc('A header with this text will be identified as the story section (case insensitive)')
            .addText(text => text
                .setPlaceholder('Story section name')
                .setValue(this.plugin.settings.storySectionName)
                .onChange(async (value) => {
                    this.plugin.settings.storySectionName = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Story section element')
            .setDesc('Elements with this tag will be checked when searching for a story section')
            .addText(text => text
                .setPlaceholder('Element tag')
                .setValue(this.plugin.settings.sectionElements)
                .onChange(async (value) => {
                    this.plugin.settings.sectionElements = value;
                    await this.plugin.saveSettings();
                }));
    }
}