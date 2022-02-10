import { Controller } from '@hotwired/stimulus';

class PubSubController extends Controller {
  static values = { key: String, template: String };

  publish(event) {
    const key = this.keyValue;
    const value = event.target.value;
    this.dispatch('send', { detail: { key, value } });
  }

  subscribe(event) {
    const { key, value } = event.detail;

    if (this.keyValue === key) {
      const newValue = this.hasTemplateValue
        ? this.templateValue.replace('{}', value)
        : value;

      // allow for updating other input's values OR the innerText depending on element
      if (this.element.tagName === 'INPUT') {
        this.element.value = newValue;
        return;
      }
      this.element.innerText = newValue;
    }
  }
}

export default PubSubController;
