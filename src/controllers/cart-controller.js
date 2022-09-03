import { Controller } from '@hotwired/stimulus';

// https://www.joshwcomeau.com/snippets/javascript/debounce/
const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
};

export default class extends Controller {
  // https://stimulus.hotwired.dev/reference/css-classes
  static classes = ['invalid', 'valid'];

  // https://stimulus.hotwired.dev/reference/values
  static values = {
    endpoint: {
      default: '/choose_plan/validate_discount_code?code=',
      type: String,
    },
  };

  initialize() {
    // this will ensure that the API does not get called too much
    // the wait time (300) is in milliseconds so adjust as needed
    this.validate = debounce(this.validate.bind(this), 300);
  }

  validate() {
    // read the value from the input
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement
    const code = this.element.value;

    fetch('/choose_plan/validate_discount_code?code=' + code)
      .then((response) => response.json())
      .then(({ valid }) => {
        if (valid) {
          this.element.classList.remove(...this.invalidClasses);
          this.element.classList.add(...this.validClasses);
        } else {
          this.element.classList.add(...this.invalidClasses);
          this.element.classList.remove(...this.validClasses);
          this.element.setCustomValidity('Thats incorrect!');
        }

        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setCustomValidity
        this.element.reportValidity();
      });
  }
}
