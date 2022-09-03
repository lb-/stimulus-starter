import { Controller } from '@hotwired/stimulus';

class TableActionController extends Controller {
  add({ params }) {
    this.dispatch('add', {
      detail: { ...params },
      bubbles: true,
      cancelable: false,
    });
  }
}

export default TableActionController;
