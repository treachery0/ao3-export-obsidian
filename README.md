# Obsidian HTML transformer

[Obsidian](https://obsidian.md) plugin to copy notes as HTML or plain text, with options to modify, transform, or remove content beforehand. 

## Usage

All actions are accessible via the context menu after right-clicking within the editor. Copying works in two-steps:

1. Choose an item from the context menu to select which part of the note to export
   - Copy heading: Copies the heading under the cursor, which may include the heading element itself depending on the plugin settings.
   - Copy selection: Copies the current selection.

2. Choose an item from the submenu to select the format of the exported content.
   - HTML: Copy contents as HTML markup. CSS styles are not included.
   - Plain text: Copy the inner text of the content. Formatting may break.
   - List: Search all list items and copy their text contents joined with commas. Currently not usable for nested lists.

## Installation

This project is not yet published as a community plugin, so manual installation is required.

- Download the .zip file from the [latest release](https://github.com/treachery0/obsidian-html-transformer/releases/latest) and extract it as folder
- Copy this folder into `.obsidian/plugins` inside your vault
- If you have Obsidian open, restart it
- Enable the plugin in the community plugins tab

## Why

There are several other plugins with similar functionality, however they lack a crucial feature I want for my use case — the ability to modify HTML before it's exported, to strip the document of certain elements or attributes.
