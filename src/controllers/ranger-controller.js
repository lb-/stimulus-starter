import { Controller } from '@hotwired/stimulus';

export default class RangerController extends Controller {
  static targets = ['total'];
  static values = { max: Number };

  connect() {
    this.calculate();
  }

  calculate(event = {}) {
    const formData = new FormData(this.element);
    const total = [...formData.values()]
      .map((val) => Number(val))
      .reduce((_, val) => _ + val);

    if (total > this.maxValue && event.target) {
      this.distribute(event.target, total - this.maxValue);
    }

    this.totalTarget.innerText = total;

    return total;
  }

  distribute(changedField, difference) {
    if (difference <= 0) return;

    const fields = [...this.element]
      .filter(({ nodeName }) => nodeName === 'INPUT')
      .filter((field) => field !== changedField);

    [...Array(difference)].forEach((val, index) => {
      const field = fields[index % fields.length];
      field.value = Number(field.value) - 1;
    });

    setTimeout(() => {
      this.calculate();
    });
  }
}
