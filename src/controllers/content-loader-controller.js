import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static values = {
    url: { default: '/path/to/content', type: String },
    refreshInterval: Number,
  };

  connect() {
    this.load();
  }

  async load() {
    await fetch()
      .then((response) => response.text())
      .then((html) => (this.element.innerHTML = html));
  }
}
