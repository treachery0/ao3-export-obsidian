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
 * Trim the document tree of unnecessary elements and attributes.
 * @param element The root element of the document.
 */
export function cleanDocument(element: HTMLElement): void {
    for(let i = 0; i < element.childElementCount; i++) {
        const child = element.children[i];

        // remove internal embeds
        if(child.find('.internal-embed[alt^="^S"]')) {
            element.removeChild(child);
            i--;

            continue;
        }

        // remove all attributes
        while(child.attributes.length > 0) {
            child.removeAttribute(child.attributes[0].name);
        }
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

/**
 * Find a section within the children of an element.
 * @param element The parent element of the children to search.
 * @param elementTitle The title text of the selected section.
 * @param elementTag The tag name marking the beginning of sections.
 * @returns The index of the first and last child node. Undefined if no such section could be identified.
 */
export function findSection(element: HTMLElement, elementTitle: string, elementTag: string): [number, number] | undefined {
    let startIndex = -1;
    let endIndex = -1;

    for(let i = 0; i < element.childElementCount; i++) {
        const child = element.children[i] as HTMLElement;

        if(child.localName !== elementTag) {
            continue;
        }

        if(startIndex >= 0) {
            endIndex = i - 1;
            break;
        }

        if(child.dataset.heading?.toLowerCase() === elementTitle) {
            startIndex = i + 1;
        }
    }

    if(startIndex < 0) {
        return;
    }

    if(endIndex < 0) {
        endIndex = element.childElementCount;
    }

    return [startIndex, endIndex];
}

/**
 * Trim the children of an element so that only the contents of a given section remain.
 * @param element The parent element of the children to search.
 * @param elementTitle The title text of the selected section.
 * @param elementTag The tag name marking the beginning of sections.
 * @returns True if the operation was successful, false otherwise.
 */
export function trimToSection(element: HTMLElement, elementTitle: string, elementTag: string): boolean {
    const sectionRange = findSection(element, elementTitle, elementTag);

    if(!sectionRange) {
        return false;
    }

    const [start, end] = sectionRange;

    trimChildren(element, start, end);

    return true;
}

/**
 * Trim the children of an element so that only the starting paragraphs remain.
 * @param root The root element of the document.
 * @returns True if the operation was successful, false otherwise.
 */
export function trimToSummary(root: HTMLElement): boolean {
    let end = -1;

    for(let i = 0; i < root.childElementCount; i++) {
        const child = root.children[i] as HTMLElement;

        if(child.localName !== 'p' || child.find('a.tag')) {
            end = i - 1;
            break;
        }
    }

    if(end < 0) {
        return false;
    }

    trimChildren(root, 0, end);

    return true;
}

/**
 * Trim the contents of an element to the contents of all <li> tags inside a specified section.
 * @param root The root element of the document.
 * @param elementTitle The title text of the selected section.
 * @param elementTag The tag name marking the beginning of sections.
 */
export function trimToTags(root: HTMLElement, elementTitle: string, elementTag: string): boolean {
    const success = trimToSection(root, elementTitle, elementTag);

    if(!success) {
        return false;
    }

    root.innerText = root
        .findAll('li')
        .map(element => element.innerText.trim())
        .join(', ');

    return true;
}