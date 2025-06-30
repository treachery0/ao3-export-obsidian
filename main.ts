import { App, Component, MarkdownRenderer, MarkdownView, Menu, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface AO3ExportSettings {
    storySectionName: string
    storySectionElement: string
}

const DEFAULT_SETTINGS: AO3ExportSettings = {
    storySectionName: 'story',
    storySectionElement: 'h2'
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
            // an active file is required
            if(!this.app.workspace.getActiveFile()) {
                new Notice('Select a note to open export options');
                return;
            }

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
                .onClick(() => this.copyDocument(container => this.reduceToSummary(container)))
            );

            menu.addItem(item => item
                .setTitle('Story')
                .setIcon('align-left')
                .onClick(() => this.copyDocument(container => this.reduceToStory(container)))
            );

            menu.showAtMouseEvent(event);
        });

        // add a settings tab
        this.addSettingTab(new ExportSettingTab(this.app, this));
    }

    async copyDocument(preprocessor?: (container: HTMLElement) => Promise<any>): Promise<void> {
        const container = await this.getCurrentDocument();

        if(!container) {
            return;
        }

        if(preprocessor) {
            await preprocessor(container);
        }

        await this.processDocument(container);

        const content = container.innerHTML;

        await navigator.clipboard.writeText(content);

        new Notice(`Copied ${content.length} characters to the clipboard!`);
    }

    async getCurrentDocument(): Promise<HTMLElement | undefined> {
        const file = this.app.workspace.getActiveFile();

        if(!file) {
            new Notice('No active note to export');
            return;
        }

        const container = document.createElement('body');
        const markdown = await this.app.vault.read(file);
        const component = new Component();

        component.load();
        await MarkdownRenderer.render(this.app, markdown, container, file.path, component);
        component.unload();

        return container;
    }

    async processDocument(container: HTMLElement): Promise<void> {
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

    removeChildrenOutside(container: HTMLElement, startIndex: number, endIndex: number): void {
        for(let i = container.childElementCount - 1; i >= endIndex; i--) {
            container.removeChild(container.children[i]);
        }

        for(let i = startIndex; i >= 0; i--) {
            container.removeChild(container.children[i]);
        }
    }

    async reduceToSummary(container: HTMLElement): Promise<void> {
        let endIndex = -1;

        for(let i = 0; i < container.childElementCount; i++) {
            const child = container.children[i] as HTMLElement;

            if(child.localName !== 'p' || child.find('a.tag')) {
                endIndex = i;
                break;
            }
        }

        if(endIndex < 0) {
            new Notice('No summary section could be identified');
            return;
        }

        this.removeChildrenOutside(container, -1, endIndex);
    }

    async reduceToStory(container: HTMLElement): Promise<void> {
        let startIndex = -1;
        let endIndex = -1;

        for(let i = 0; i < container.childElementCount; i++) {
            const child = container.children[i] as HTMLElement;

            if(child.localName !== this.settings.storySectionElement) {
                continue;
            }

            if(startIndex >= 0) {
                endIndex = i;
                break;
            }

            if(child.dataset.heading?.toLowerCase() === this.settings.storySectionName) {
                startIndex = i;
            }
        }

        if(startIndex < 0) {
            new Notice('No story section could be identified');
            return;
        }

        if(endIndex < 0) {
            endIndex = container.childElementCount;
        }

        this.removeChildrenOutside(container, startIndex, endIndex);
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
                .setValue(this.plugin.settings.storySectionElement)
                .onChange(async (value) => {
                    this.plugin.settings.storySectionElement = value;
                    await this.plugin.saveSettings();
                }));
    }
}