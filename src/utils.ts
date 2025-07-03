import { App, Component, Editor, EditorPosition, MarkdownFileInfo, MarkdownRenderer, MarkdownView, Notice, TFile } from "obsidian";

/**
 * Convert a line and character number to an editor position.
 * @param line The line number.
 * @param character The character number.
 * @returns A new editor position.
 * @copyright Copied and deobfuscated from Obsidian's source code.
 */
function toEditorPosition(line: number, character: number | undefined): EditorPosition {
    if(character === undefined) {
        character = 0;
    }

    return {
        line: line,
        ch: character
    };
}

/**
 * Render a markdown string as an HTML document.
 * @param app The current app instance.
 * @param markdown The markdown string to render.
 * @param path The path of the markdown document.
 */
async function renderMarkdown(app: App, markdown: string, path: string): Promise<HTMLElement> {
    const container = document.createElement('body');
    const component = new Component();

    component.load();
    await MarkdownRenderer.render(app, markdown, container, path, component);
    component.unload();

    return container;
}

/**
 * Trim an element of unnecessary children and attributes.
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
 * Default function to convert a container element into a string.
 * @param element The container element.
 * @returns The inner HTML of the element.
 */
export function defaultStringify(element: HTMLElement): string {
    return element.innerHTML.trim();
}

/**
 * Find the content boundaries of a heading within a document.
 * @param app The current app instance.
 * @param file The current markdown file.
 * @param editor The current editor instance.
 * @param currentLine The line number of the heading element.
 * @returns The heading's text, its starting and ending position as an object.
 * @copyright Copied and deobfuscated from Obsidian's source code.
 */
export function getSelectionUnderHeading(app: App, file: TFile, editor: Editor, currentLine: number): {heading: string, start: EditorPosition, end: EditorPosition} | null {
    const cache = app.metadataCache.getFileCache(file);

    if(!cache){
        return null;
    }

    const headings = cache.headings;

    if(!headings || headings.length === 0){
        return null;
    }

    let currentHeading = null;
    let nextHeading = null;
    let currentHeadingLevel = 0;

    // iterate over all headings in the file
    for(let i = 0; i < headings.length; i++) {
        const heading = headings[i];

        // if we've found the current heading and a lower/equal-level heading appears, it's the end
        if(currentHeading && heading.level <= currentHeadingLevel) {
            nextHeading = heading;
            break;
        }

        // if we haven't found the current heading yet
        if(!currentHeading && heading.position.start.line === currentLine) {
            currentHeadingLevel = heading.level;
            currentHeading = heading;
        }
    }

    // if we didn't find a matching heading, return null
    if(!currentHeading) {
        return null;
    }

    // find the ending line of the section
    let endLine;

    if(nextHeading) {
        // move up from the start of the next heading until we find non-empty line
        endLine = nextHeading.position.start.line - 1;

        while(endLine > currentLine && editor.getLine(endLine).trim() === "") {
            endLine--;
        }
    }
    else {
        // if there's no next heading, end of document
        endLine = editor.lineCount() - 1;
    }

    // return the range and heading title
    return {
        heading: currentHeading.heading.trim(),
        start: toEditorPosition(currentLine, 0),
        end: toEditorPosition(endLine, editor.getLine(endLine).length)
    }
}

/**
 * Extract a heading as HTML from a markdown document.
 * @param editor The current editor instance.
 * @param view The current markdown view.
 * @param lineNumber The line number of the heading element.
 * @returns An HTML element with the desired heading as its content, if successful.
 */
export async function getHeadingAsHTML(editor: Editor, view: MarkdownFileInfo | MarkdownView, lineNumber: number): Promise<HTMLElement | undefined> {
    if(!view.file) {
        return;
    }

    const headingSelection = getSelectionUnderHeading(view.app, view.file, editor, lineNumber);

    if(!headingSelection) {
        return;
    }

    const markdown = editor.getRange(headingSelection.start, headingSelection.end);

    return renderMarkdown(view.app, markdown, view.file.path);
}

/**
 * Extract the current selection as HTML from a markdown document.
 * @param editor The current editor instance.
 * @param view The current markdown view.
 * @returns An HTML element with the current selection as its content, if successful.
 */
export async function getSelectionAsHTML(editor: Editor, view: MarkdownFileInfo | MarkdownView): Promise<HTMLElement | undefined> {
    if(!view.file) {
        return;
    }

    const markdown = editor.getSelection();

    return renderMarkdown(view.app, markdown, view.file.path);
}
