import { Controller } from '@hotwired/stimulus';

export default class RangerController extends Controller {
  static targets = ['total'];

  connect() {
    this.calculate();
  }

  calculate() {
    const formData = new FormData(this.element);
    const total = [...formData.values()]
      .map((val) => Number(val))
      .reduce((_, val) => _ + val);

    this.totalTarget.innerText = total;

    return total;
  }
}
