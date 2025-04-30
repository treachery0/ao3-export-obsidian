import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface AO3ExportSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: AO3ExportSettings = {
    mySetting: 'default'
}

export default class AO3ExportPlugin extends Plugin {
    settings: AO3ExportSettings;

    async onload(): Promise<void> {
        await this.loadSettings();

        this.addCommand({
            id: 'export',
            name: 'Export for AO3',
            editorCallback: (editor: Editor, view: MarkdownView): void => {
                const children: HTMLElement[] = view.contentEl.findAll('.cm-content > *');
                const result: HTMLElement[] = [];
                let capture: boolean = false;

                console.log('children', children);

                for (const child of children) {
                    const isH2: boolean = child.classList.contains('HyperMD-header-2');

                    if (capture) {
                        // found next header
                        if (isH2) {
                            console.log('found next header');
                            break;
                        }

                        // add next node
                        result.push(child);
                        continue;
                    }

                    // evil ass zero width whitespace
                    const headerText = child.textContent
                        ?.replace(/[\u200B-\u200D\uFEFF\u2060]/g, '')
                        .trim()
                        .toLowerCase();

                    // found story header
                    if (isH2 && headerText === 'story') {
                        console.log('found story header');

                        capture = true;
                    }
                }

                console.log(`Exporting ${result.length} out of ${children.length} elements`)

                const parent = document.createElement('div');

                for (const child of result) {
                    parent.appendChild(child);
                }

                console.log(parent.innerHTML);
            }
        });

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new SampleSettingTab(this.app, this));
    }

    async onunload(): Promise<void> {

    }

    async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }
}

class SampleModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.setText('Woah!');
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}

class SampleSettingTab extends PluginSettingTab {
    plugin: AO3ExportPlugin;

    constructor(app: App, plugin: AO3ExportPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Setting #1')
            .setDesc('It\'s a secret')
            .addText(text => text
                .setPlaceholder('Enter your secret')
                .setValue(this.plugin.settings.mySetting)
                .onChange(async (value) => {
                    this.plugin.settings.mySetting = value;
                    await this.plugin.saveSettings();
                }));
    }
}