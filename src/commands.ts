import { Editor, MarkdownFileInfo, MarkdownView, Notice } from "obsidian";
import { cleanDocument, defaultStringify, getHeadingAsHTML, getSelectionAsHTML } from "./utils";
import { AO3ExportSettings } from "./settings";

async function copyText(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);

    new Notice(`Copied ${text.length} characters to the clipboard!`);
}

export async function copyCurrentSelection(editor: Editor, view: MarkdownFileInfo | MarkdownView, settings: AO3ExportSettings) {
    const container = await getSelectionAsHTML(editor, view);

    if(!container) {
        new Notice('');
        return;
    }

    cleanDocument(container, settings.removedAttributes, settings.removedSelectors);

    const text = defaultStringify(container)

    await copyText(text);
}

export async function copyCurrentHeading(editor: Editor, view: MarkdownFileInfo | MarkdownView, settings: AO3ExportSettings) {
    const container = await getHeadingAsHTML(editor, view);

    if(!container) {
        return;
    }

    cleanDocument(container, settings.removedAttributes, settings.removedSelectors);

    if(container.childElementCount) {
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
        .findAll('li')
        .map(element => element.innerText.trim())
        .join(', ');

    await copyText(list);
}
