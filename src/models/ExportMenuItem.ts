import { DisplayCallback } from "./DisplayCallback";
import { ExportCallback } from "./ExportCallback";

export interface ExportMenuItem {
    title: string
    icon: string
    exportFn: ExportCallback
    displayFn: DisplayCallback
}
