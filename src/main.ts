import { Plugin, Editor, MarkdownFileInfo, MarkdownView, Menu } from "obsidian";
import { AO3ExportSettings, AO3ExportSettingTab, getDefaultSettings } from "./settings";
import { copyCurrentHeading, copyCurrentHeadingAsList, copyCurrentSelection } from "./commands";

export default class AO3ExportPlugin extends Plugin {
    settings: AO3ExportSettings;

    async loadSettings() {
        this.settings = Object.assign({}, getDefaultSettings(), await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async onload() {
        await this.loadSettings();

        this.addSettingTab(
            new AO3ExportSettingTab(this.app, this)
        );

        this.registerEvent(
            this.app.workspace.on(
                'editor-menu',
                (menu, editor, view) => this.registerContextMenu(menu, editor, view)
            )
        );
    }

    registerContextMenu(menu: Menu, editor: Editor, view: MarkdownView | MarkdownFileInfo) {
        const activeItems = items.filter(item => item.isActive(editor, view));

        if(activeItems.length) {
            menu.addSeparator();
        }

        activeItems.forEach(activeItem => {
            menu.addItem(item => item
                .setTitle(activeItem.title)
                .setIcon(activeItem.icon)
                .onClick(async () => activeItem.onClick(editor, view, this.settings))
            );
        });
    }
}

interface ContextMenuItem {
    title: string
    icon: string
    onClick: (editor: Editor, view: MarkdownView | MarkdownFileInfo, settings: AO3ExportSettings) => any
    isActive: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => boolean
}

const items: ContextMenuItem[] = [
    {
        title: 'Copy selection for AO3',
        icon: 'file-down',
        onClick: copyCurrentSelection,
        isActive: editor => editor.somethingSelected()
    },
    {
        title: 'Copy heading for AO3',
        icon: 'heading',
        onClick: copyCurrentHeading,
        isActive: hasHeaderSelected
    },
    {
        title: 'Copy heading as list for AO3',
        icon: 'list',
        onClick: copyCurrentHeadingAsList,
        isActive: hasHeaderSelected
    }
];

function hasHeaderSelected(editor: Editor): boolean {
    const lineNumber = editor.getCursor().line;
    const lineText = editor.getLine(lineNumber);
    const matches = lineText.match(/^#{1,6} (.*)/m);

    return matches !== null;
}
