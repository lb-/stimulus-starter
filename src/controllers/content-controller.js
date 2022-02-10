import { Controller } from '@hotwired/stimulus';

class ContentController extends Controller {
  update(event) {
    const field = event.params.field;
    const value = event.currentTarget.value;
    this.dispatch('updated', { detail: { field, value } });
  }
}

export default ContentController;
