import { Controller } from '@hotwired/stimulus';
import Chance from 'chance';

/**
 * Just a fun controller to put random content into a controlled
 * element.
 */
export default class extends Controller {
  static values = {
    seed: { default: `${Math.random() * 10000}`, type: String },
    type: { default: 'paragraph', type: String },
  };

  static targets = ['element'];

  connect() {
    if (!this.seedValue) this.seedValue = new Date().toISOString();
    const element = this.hasElementTarget ? this.elementTarget : this.element;
    const seed = this.seedValue;
    const type = this.typeValue;

    const chance = new Chance(seed);
    this._chance = chance;

    const textContent = chance[type]();

    element.textContent = textContent;
  }

  disconnect() {
    delete this._chance;
  }
}
