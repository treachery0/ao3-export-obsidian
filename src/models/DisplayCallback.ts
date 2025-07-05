import { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";

export type DisplayCallback = (editor: Editor, view: MarkdownView | MarkdownFileInfo) => boolean