import * as focusTrap from 'focus-trap';
import { Controller } from '@hotwired/stimulus';

/**
 * Traps the focus on the element
 * https://github.com/focus-trap/focus-trap#createoptions
 */
export default class extends Controller {
  // for consistency - all options will default to false but this could be changed
  static values = {
    active: { default: false, type: Boolean },
    // options
    clickOutsideDeactivates: { default: false, type: Boolean },
    escapeDeactivates: { default: false, type: Boolean },
    // delayInitialFocus: { default: true, type: Boolean }, // not implemented
    fallbackFocus: { default: '', type: String },
    initialFocus: { default: '', type: String },
  };

  static targets = ['fallbackFocus', 'initialFocus'];

  connect() {
    this._focusTrap = focusTrap.createFocusTrap(
      this.element,
      this.getOptions()
    );

    if (this.activeValue) this.activate();
  }

  getOptions() {
    const clickOutsideDeactivates = this.clickOutsideDeactivatesValue;
    const escapeDeactivates = this.escapeDeactivatesValue;

    const options = {
      // could go even further here, passing a method that then fires an event that can be defaultPrevented & falling back to the value
      clickOutsideDeactivates,
      escapeDeactivates,
      onActivate: () => this._onActivate(),
      onPostActivate: () => this._onPostActivate(),
      onDeactivate: () => this._onDeactivate(),
      onPostDeactivate: () => this._onPostDeactivate(),
    };

    // set initialFocus to target element if present or string (selector)
    const initialFocus = this.hasInitialFocusTarget
      ? this.initialFocusTarget
      : this.initialFocusValue;

    if (initialFocus) options.initialFocus = initialFocus;

    // set fallbackFocus to target element if present or string (selector)
    const fallbackFocus = this.hasFallbackFocusTarget
      ? this.fallbackFocusTarget
      : this.fallbackFocusValue;

    if (fallbackFocus) options.fallbackFocus = fallbackFocus;

    return options;
  }

  activate() {
    this._focusTrap.activate();
  }

  disconnect() {
    this.deactivate();
  }

  deactivate() {
    this._focusTrap.deactivate();
  }

  /**
   * A function that will be called before sending focus to the
   * target element upon activation.
   */
  _onActivate() {
    this.dispatch('activate');
  }

  /**
   * A function that will be called after sending focus to the
   * target element upon activation.
   */
  _onPostActivate() {
    this.dispatch('activated');
  }

  /**
   * A function that will be called before returning focus to the
   * node that had focus prior to activation (or configured with the
   * setReturnFocus option) upon deactivation.
   */
  _onDeactivate() {
    this.dispatch('deactivate');
  }

  /**
   * A function that will be called after the trap is deactivated,
   * after onDeactivate. If the returnFocus deactivation option was set,
   * it will be called after returning focus to the node that had focus
   * prior to activation (or configured with the setReturnFocus option)
   * upon deactivation; otherwise, it will be called after
   * deactivation completes.
   */
  _onPostDeactivate() {
    this.dispatch('deactivated');
  }
}
