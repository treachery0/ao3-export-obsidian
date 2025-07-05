import { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { HtmlTransformerSettings } from "./HtmlTransformerSettings";

export type ExportCallback = (editor: Editor, view: MarkdownView | MarkdownFileInfo, settings: HtmlTransformerSettings) => Promise<HTMLElement | undefined>