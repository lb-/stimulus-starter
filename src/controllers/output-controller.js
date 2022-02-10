import { Controller } from '@hotwired/stimulus';

class OutputController extends Controller {
  static targets = ['item'];

  updateLabel(event) {
    const { field, value } = event.detail;

    this.itemTargets.forEach((element) => {
      if (element.dataset.field === field) {
        element.innerText = value;
      }
    });
  }
}

export default OutputController;
