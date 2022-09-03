import { Controller } from '@hotwired/stimulus';
// import { reducer } from 'reducer';

class StoreController extends Controller {
  static values = { initial: { type: Object, default: {} } };

  initialize() {
    this.getState = this.getState.bind(this);
    this._state = this.initialValue;
    this._reducer = this.element.reducer;
    setTimeout(() => {
      // send update to subscribers after all elements load
      this.updated();
    });
    console.log(this.element, this._state);
  }

  getState() {
    return this._state;
  }

  receive(event) {
    console.log('receive', { event, state: this._state });
    const { currentTarget, detail = {} } = event;
    const newState = this._reducer(this.getState(), detail);
    if (newState) {
      this._state = newState;
      this.updated(currentTarget);
    }
  }

  /**
   * sends updates to subscribers
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
