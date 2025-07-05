import { Editor, MarkdownFileInfo, MarkdownView, Menu, MenuItem, Notice } from "obsidian";
import { ExportMenuItem } from "./models/ExportMenuItem";
import { TransformMenuItem } from "./models/TransformMenuItem";
import { HtmlTransformerSettings } from "./models/HtmlTransformerSettings";
import { ExportCallback } from "./models/ExportCallback";
import { TransformCallback } from "./models/TransformCallback";
import { getHeadingAsHTML, getSelectionAsHTML } from "./utils";

const exportItems: ExportMenuItem[] = [
    {
        title: 'Copy selection',
        icon: 'text-select',
        exportFn: async (editor, view) => {
            return getSelectionAsHTML(editor, view);
        },
        displayFn: (editor) => {
            return editor.somethingSelected();
        }
    },
    {
        title: 'Copy heading',
        icon: 'heading',
        exportFn: async (editor, view, settings) => {
            const container = await getHeadingAsHTML(editor, view);

            if(!container) {
                return;
            }

            if(container.childElementCount && !settings.includeHeadingElement) {
                container.removeChild(container.children[0]);
            }

            return container;
        },
        displayFn: (editor) => {
            const index = editor.getCursor().line;
            const line = editor.getLine(index);
            const matches = line.match(/^#{1,6} (.*)/m);

            return matches !== null;
        }
    }
];

const transformItems: TransformMenuItem[] = [
    {
        title: 'Without changes',
        icon: 'circle-slash',
        transformFn: (element) => {
            return element;
        }
    },
    {
        title: 'Plain text',
        icon: 'a-large-small',
        transformFn: (element) => {
            return element.innerText.trim();
        }
    },
    {
        title: 'List',
        icon: 'list',
        transformFn: (element) => {
            const list = element
                .findAll('li')
                .map(e => e.innerText.trim())
                .join(', ');

            if(!list.length) {
                throw new Error('No list items could be located');
            }

            return list;
        }
    }
]

export function extendContextMenu(menu: Menu, editor: Editor, view: MarkdownView | MarkdownFileInfo, settings: HtmlTransformerSettings) {
    // not all exports should be displayed depending on context
    const displayedExports = exportItems.filter(item => {
        return item.displayFn(editor, view);
    });

    // separate from other menu items if at least 1 option is displayed
    if(displayedExports.length) {
        menu.addSeparator();
    }

    // add a menu item with a submenu for each displayed export option
    displayedExports.forEach(exportItem => {
        menu.addItem(item => createSubmenu(exportItem, item, editor, view, settings));
    });
}

export function createSubmenu(exportItem: ExportMenuItem, menuItem: MenuItem, editor: Editor, view: MarkdownView | MarkdownFileInfo, settings: HtmlTransformerSettings) {
    menuItem
        .setTitle(exportItem.title)
        .setIcon(exportItem.icon);

    // @ts-ignore Why is this not in the official API?
    const submenu: Menu = menuItem.setSubmenu();

    transformItems.forEach(transformItem => {
        submenu.addItem(item => item
            .setTitle(transformItem.title)
            .setIcon(transformItem.icon)
            .onClick(async () => exportDocument(editor, view, settings, exportItem.exportFn, transformItem.transformFn)))
    });
}

export async function exportDocument(editor: Editor, view: MarkdownView | MarkdownFileInfo, settings: HtmlTransformerSettings, exportFn: ExportCallback, transformFn: TransformCallback) {
    const container = await exportFn(editor, view, settings);

    if(!container) {
        return;
    }

    if(settings.globalTransform) {
        transformGlobal(container, settings);
    }

    let transformed;

    try {
        transformed = transformFn(container, settings);
    }
    catch(e) {
        new Notice(e.message);
        return;
    }

    if(typeof transformed !== 'string') {
        transformed = transformed.innerHTML.trim();
    }

    if(!transformed.length) {
        new Notice('Selection was empty');
        return;
    }

    await navigator.clipboard.writeText(transformed);

    new Notice(`Copied ${transformed.length} characters to the clipboard!`);
}

export function transformGlobal(element: HTMLElement, settings: HtmlTransformerSettings): HTMLElement {
    const combinedSelector = settings.removedSelectors.filter(x => x.length).join(',');

    // remove chosen elements
    if(combinedSelector.length) {
        element.querySelectorAll(combinedSelector).forEach(el => {
            el.parentElement?.removeChild(el);
        });
    }

    if(settings.removedAttributes.length) {
        element.querySelectorAll('*').forEach(el => {
            // remove chosen attributes
            settings.removedAttributes.forEach(attr => el.removeAttribute(attr));
        });
    }

    return element;
}
