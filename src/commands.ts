import { Editor, MarkdownFileInfo, MarkdownView, Notice } from "obsidian";
import { AO3ExportSettings } from "./settings";
import { cleanDocument, defaultStringify, getHeadingAsHTML, getSelectionAsHTML } from "./utils";

async function copyText(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);

    new Notice(`Copied ${text.length} characters to the clipboard!`);
}

export async function copyCurrentSelection(editor: Editor, view: MarkdownFileInfo | MarkdownView, settings: AO3ExportSettings) {
    const container = await getSelectionAsHTML(editor, view);

    if(!container) {
        return;
    }

    cleanDocument(container, settings.removedAttributes, settings.removedSelectors);

    const text = defaultStringify(container);

    await copyText(text);
}

export async function copyCurrentHeading(editor: Editor, view: MarkdownFileInfo | MarkdownView, settings: AO3ExportSettings) {
    const container = await getHeadingAsHTML(editor, view);

    if(!container) {
        return;
    }

    cleanDocument(container, settings.removedAttributes, settings.removedSelectors);

    if(container.childElementCount && !settings.includeHeadingElement) {
        container.removeChild(container.children[0]);
    }

    const text = defaultStringify(container);

    await copyText(text);
}

export async function copyCurrentHeadingAsList(editor: Editor, view: MarkdownFileInfo | MarkdownView, settings: AO3ExportSettings) {
    const container = await getHeadingAsHTML(editor, view);

    if(!container) {
        return;
    }

    cleanDocument(container, settings.removedAttributes, settings.removedSelectors);

    const list = container
        .findAll(settings.listItemSelector)
        .map(element => element.innerText.trim())
        .join(settings.listItemSeparator);

    if(!list.length) {
        new Notice('No list items could be located');
        return;
    }

    await copyText(list);
}
