import { Controller } from '@hotwired/stimulus';

class ModalTriggerController extends Controller {
  static classes = ['loading'];

  static values = {
    contentTitle: { default: '', type: String },
    contentBody: { default: '', type: String },
    contentUrl: { default: '', type: String },
    modalActiveId: { default: '', type: String },
    modalBaseTemplateId: { default: 'modal-base-template', type: String },
    modalContainerId: { default: 'modal-container', type: String },
  };

  static targets = ['button', 'contentTitle', 'contentBody'];

  connect() {
    this.dispatch('connected');
  }

  getUniqueModalId(id = 'modal', count = 1) {
    const newId = `${id}${count ? '-' + count : ''}`;
    return document.getElementById(newId)
      ? this.getUniqueModalId(id, count++)
      : newId;
  }

  getModalContent() {
    const urlValue = this.contentUrlValue;

    const title =
      (this.hasContentTitleTarget &&
        this.contentTitleTarget.content.firstElementChild.cloneNode(true)
          .outerHTML) ||
      this.contentTitleValue;

    const body =
      (this.hasContentBodyTarget &&
        this.contentBodyTarget.content.firstElementChild.cloneNode(true)
          .outerHTML) ||
      this.contentBodyValue;

    if (!urlValue) return Promise.resolve({ title, body });

    const [url, titleKey, bodyKey] = urlValue.split(' ');

    return fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then((data) => ({
        title: data[titleKey] || title,
        body: data[bodyKey] || body,
      }))
      .catch((error) => ({
        // not fully functional - better error handling needed
        title: error.title || title,
        body: error.message || body,
      }));
  }

  open() {
    // modal is already active
    if (this.modalActiveIdValue) return;

    const template = document.querySelector(
      `template#${this.modalBaseTemplateIdValue}`
    );

    const newModal = template.content.firstElementChild.cloneNode(true);

    const modalActiveIdValue = this.getUniqueModalId(
      `modal-${this.element.id || ''}`
    );

    newModal.id = modalActiveIdValue;
    this.modalActiveIdValue = modalActiveIdValue;

    if (this.hasButtonTarget) {
      this.buttonTarget.disabled = true;
      this.buttonTarget.classList.add(...this.loadingClasses);
    }

    this.getModalContent().then(({ title, body }) => {
      newModal.querySelector('slot[name="title"]').outerHTML = title;
      newModal.querySelector('slot[name="body"]').outerHTML = body;

      const portal = document.getElementById(this.modalContainerIdValue);
      portal.appendChild(newModal);

      this.hasButtonTarget &&
        this.buttonTarget.classList.remove(...this.loadingClasses);
    });
  }

  reset({ detail: { id } }) {
    if (id === this.modalActiveIdValue) {
      this.modalActiveIdValue = '';
      if (this.hasButtonTarget) this.buttonTarget.disabled = false;
    }
  }
}

export default ModalTriggerController;
