import { Controller } from '@hotwired/stimulus';

class StoreController extends Controller {
  initialize() {
    this.getState = this.getState.bind(this);
    this._state = JSON.parse(this.element.textContent);
    console.log(this.element, this._state);
  }

  getState() {
    return this._state;
  }

  receive(event) {
    console.log('receive', { event, state: this._state });
    const { currentTarget, detail = {} } = event;
    if (this.reducer(detail)) {
      this.updated(currentTarget);
    }
  }

  reducer({ type }) {
    if (type === 'counter/increment') {
      this._state.counter += 1;
      return true;
    }
  }

  /**
   * sends an update event
   */
  updated(target = document.body) {
    this.dispatch('subscribe', {
      bubbles: true,
      cancelable: false,
      detail: { getState: this.getState },
      target,
    });
  }
}

export default StoreController;
