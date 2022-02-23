// inspiration
// https://github.com/themesberg/flowbite/blob/main/src/components/modal.js
// https://github.com/tailwindlabs/headlessui/blob/main/packages/%40headlessui-react/src/components/dialog/dialog.tsx

import { Controller } from '@hotwired/stimulus';

class ModalController extends Controller {
  static classes = ['backdrop', 'hidden', 'visible'];
  static targets = ['closeButton', 'title', 'description'];

  connect() {
    const modal = this.element;
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('role', 'dialog');
    modal.removeAttribute('hidden');
    modal.removeAttribute('aria-hidden');
    this.createBackdrop();
    this.scrollLock();
    modal.classList.remove(...this.hiddenClasses);
    modal.classList.add(...this.visibleClasses);
  }

  createBackdrop() {
    if (document.querySelector('[modal-backdrop]')) return;

    const backdrop = document.createElement('div');

    backdrop.setAttribute('modal-backdrop', '');
    backdrop.classList.add(...this.backdropClasses);

    document.querySelector('#modal-container').prepend(backdrop);

    backdrop.addEventListener('click', (event) => {
      this.close(event);
    });
  }

  scrollLock() {
    //
  }

  scrollUnlock() {
    //
  }

  close() {
    const id = this.element.id;
    const event = this.dispatch('close', { cancelable: true, detail: { id } });
    if (event.defaultPrevented) return;

    const modal = this.element;

    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    modal.removeAttribute('role');
    modal.classList.remove(...this.visibleClasses);
    modal.classList.add(...this.hiddenClasses);
    this.scrollUnlock();

    document.querySelector('[modal-backdrop]').remove();
    this.element.remove();
  }

  disconnect() {
    const id = this.element.id;
    this.dispatch('closed', {
      cancelable: false,
      target: window.document,
      detail: { id },
    });
  }
}

export default ModalController;
