import { Controller } from '@hotwired/stimulus';

class Editor extends Controller {
  static classes = ['hidden'];
  static targets = ['button'];

  showButton() {
    // ensure focus can 'move' to next target in container (e.g. press 'tab')
    setTimeout(() => this.buttonTarget.classList.remove(this.hiddenClass));
  }

  hideButton() {
    // ensure focus can 'move' to next target in container (e.g. press 'tab')
    setTimeout(() => this.buttonTarget.classList.add(this.hiddenClass));
  }
}

export default Editor;
