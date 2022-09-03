import { Controller } from '@hotwired/stimulus';

class CounterController extends Controller {
  update({ detail: { getState } }) {
    console.log('update received', getState());
    this.element.innerHTML = getState().counter;
  }
}

export default CounterController;
