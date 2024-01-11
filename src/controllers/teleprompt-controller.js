import { Controller } from '@hotwired/stimulus';

/**
 * @see https://github.com/soxofaan/scrollocue/blob/master/js/scrollocue.js
 */
export default class extends Controller {
  static classes = ['active'];
  static targets = ['active'];
  static values = {
    index: { default: -1, type: Number },
    lines: { default: 'h1, p', type: String },
  };

  connect() {
    this.clear();
    if (this.indexValue < 0) this.indexValue = 0;
  }

  get lines() {
    return [...this.element.querySelectorAll(this.linesValue)];
  }

  clear() {
    [...this.activeTargets].forEach((element) => {
      element.removeAttribute(`data-${this.identifier}-target`);
    });
  }

  down({ params: { amount = 1 } = {} } = {}) {
    this.indexValue = Math.min(this.indexValue + amount, this.lines.length - 1);
  }

  up({ params: { amount = 1 } = {} } = {}) {
    this.indexValue = Math.max(0, this.indexValue - amount);
  }

  indexValueChanged(currentIndex) {
    this.clear();
    if (currentIndex === -1) return;
    const element = this.lines[currentIndex];
    element.setAttribute(`data-${this.identifier}-target`, 'active');
  }

  activeTargetConnected(element) {
    element.classList.add(...this.activeClasses);
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  activeTargetDisconnected(element) {
    element.classList.remove(...this.activeClasses);
  }
}
