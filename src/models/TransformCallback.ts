import { HtmlTransformerSettings } from "./HtmlTransformerSettings";

export type TransformCallback = (element: HTMLElement, settings: HtmlTransformerSettings) => HTMLElement | string