import { App, Component, MarkdownRenderer } from "obsidian";

/**
 * Remove all children of an element outside a specified range.
 * @param element The parent element.
 * @param start The index of the first child element to keep.
 * @param end The index of the last child element to keep.
 */
export function trimChildren(element: HTMLElement, start: number, end: number): void {
    // remove everything after the last index
    for(let i = element.childElementCount - 1; i > end; i--) {
        element.removeChild(element.children[i]);
    }

    // remove everything before the first index
    for(let i = start - 1; i >= 0; i--) {
        element.removeChild(element.children[i]);
    }
}

/**
 * Render the currently selected document as HTML.
 * @param app The current obsidian app instance.
 * @returns The root element of the rendered document, if the operation was successful.
 */
export async function renderCurrentDocument(app: App): Promise<HTMLElement | undefined> {
    const file = app.workspace.getActiveFile();

    if(!file) {
        return;
    }

    const container = document.createElement('body');
    const markdown = await app.vault.read(file);
    const component = new Component();

    component.load();
    await MarkdownRenderer.render(app, markdown, container, file.path, component);
    component.unload();

    return container;
}