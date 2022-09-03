import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

import { Controller } from '@hotwired/stimulus';

class TipTapController extends Controller {
  static targets = ['element', 'menu'];
  static values = { content: String };

  connect() {
    console.log('tip-tap', this.element);
    this.setupEditor();
  }

  disconnect() {
    this._editor?.destroy();
  }

  setupEditor() {
    const content = this.contentValue;
    const element = this.elementTarget;

    const editor = new Editor({
      content,
      element,
      extensions: [StarterKit],
      onSelectionUpdate: (_) => this.onSelectionUpdate(_),
    });

    console.log('editor', { content, element, editor });

    this._editor = editor;
  }

  onSelectionUpdate() {
    console.log('selection update');
    this.updateMenu();
  }

  updateMenu() {
    // probably should create a target on each button
    const buttons = this.menuTarget.querySelectorAll('button');

    buttons.forEach((button) => {
      // should not hard-code tipTap here as controller could be registered differently
      const command = button.dataset['tipTapCommandParam'];
      const options = JSON.stringify(
        button.dataset['tipTapOptionsParam'] || ''
      );
      const isActive = this._editor.isActive(command, {});
      console.log('command', { isActive, button, command, options });
    });
  }

  toggleFormat(event) {
    const {
      params: { command, options },
      target,
    } = event;

    const fn = this._editor.commands[command];
    if (!fn) return;

    console.log('toggleFormat', { command, target, fn });
    fn(options);
    this._editor.commands.focus();
  }
}

export default TipTapController;
