import { Controller } from '@hotwired/stimulus';

class ModalTriggerController extends Controller {
  static values = {
    modalActiveId: { default: '', type: String },
    modalContainerId: { default: 'modal-container', type: String },
  };

  getValidModalId({ count = 0, id }) {
    const newId = `${id}${count ? '-' + count : ''}`;
    return document.getElementById(newId)
      ? this.getValidModalId({ id, count: count++ })
      : newId;
  }

  open({ params: { templateId } }) {
    if (this.modalActiveIdValue) return;

    const template = document.querySelector(`template#${templateId}`);

    const newModal = template.content.firstElementChild.cloneNode(true);

    const modalActiveIdValue = this.getValidModalId(
      { id: newModal.id || `${templateId}--modal` },
      newModal
    );

    newModal.id = modalActiveIdValue;
    this.modalActiveIdValue = modalActiveIdValue;

    const portal = document.getElementById(this.modalContainerIdValue);
    portal.appendChild(newModal);
  }

  reset({ detail: { id } }) {
    if (id === this.modalActiveIdValue) {
      this.modalActiveIdValue = '';
    }
  }
}

export default ModalTriggerController;
