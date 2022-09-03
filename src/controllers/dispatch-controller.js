import { Controller } from '@hotwired/stimulus';

class DispatchController extends Controller {
  send(event) {
    console.log('send', event);
    const { type, ...payload } = event.params;
    this.dispatch('action', {
      bubbles: true,
      cancelable: false,
      detail: { type, payload },
    });
  }
}

export default DispatchController;
