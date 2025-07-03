import { Plugin } from "obsidian";
import { copyCurrentHeading, copyCurrentHeadingAsList, copyCurrentSelection } from "./commands";

export default class AO3ExportPlugin extends Plugin {
    async onload() {
        this.registerEvent(
            this.app.workspace.on('editor-menu', (menu, editor, view) => {
                const hasSelection = editor.somethingSelected();

                const lineNumber = editor.getCursor().line;
                const lineText = editor.getLine(lineNumber);
                const matches = lineText.match(/^#{1,6} (.*)/m);
                const isHeader = matches !== null;

                if(hasSelection || isHeader) {
                    menu.addSeparator();
                }

                if(hasSelection) {
                    menu.addItem(item => item
                        .setTitle('Copy selection for AO3')
                        .setIcon('file-down')
                        .onClick(async () => copyCurrentSelection(editor, view))
                    );
                }

                if(isHeader) {
                    menu.addItem(item => item
                        .setTitle('Copy heading for AO3')
                        .setIcon('heading')
                        .onClick(async () => copyCurrentHeading(editor, view, lineNumber))
                    );

                    menu.addItem(item => item
                        .setTitle('Copy heading as list for AO3')
                        .setIcon('list')
                        .onClick(async () => copyCurrentHeadingAsList(editor, view, lineNumber))
                    );
                }
            })
        );
    }
}
