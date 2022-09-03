import { Controller } from '@hotwired/stimulus';

class TableController extends Controller {
  static targets = ['row', 'status'];

  show({ detail: { url } = {} }) {
    if (url) {
      const rowCount = this.rowTargets.length;
      this.statusTarget.innerText = `Request from: ${url}, there are ${rowCount} rows.`;
    }
  }
}

export default TableController;
