import { Editor, MarkdownFileInfo, MarkdownView, Notice } from "obsidian";
import { cleanDocument, defaultStringify, getHeadingAsHTML, getSelectionAsHTML } from "./utils";

async function copyText(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);

    new Notice(`Copied ${text.length} characters to the clipboard!`);
}

export async function copyCurrentSelection(editor: Editor, view: MarkdownFileInfo | MarkdownView) {
    const container = await getSelectionAsHTML(editor, view);

    if(!container) {
        new Notice('');
        return;
    }

    cleanDocument(container);

    const text = defaultStringify(container)

    await copyText(text);
}

export async function copyCurrentHeading(editor: Editor, view: MarkdownFileInfo | MarkdownView, lineNumber: number) {
    const container = await getHeadingAsHTML(editor, view, lineNumber);

    if(!container) {
        return;
    }

    cleanDocument(container);

    if(container.childElementCount) {
        container.removeChild(container.children[0])
    }

    const text = defaultStringify(container)

    await copyText(text);
}

export async function copyCurrentHeadingAsList(editor: Editor, view: MarkdownFileInfo | MarkdownView, lineNumber: number) {
    const container = await getHeadingAsHTML(editor, view, lineNumber);

    if(!container) {
        return;
    }

    cleanDocument(container);

    const list = container
        .findAll('li')
        .map(element => element.innerText.trim())
        .join(', ');

    await copyText(list);
}
