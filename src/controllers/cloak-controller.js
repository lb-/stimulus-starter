import { Controller } from '@hotwired/stimulus';
import TokenList from '@wordpress/token-list';

/**
 * General idea is provide a generic way to handle a common case of
 * - I want this thing to NOT be visible until we know Stimulus has connected ot it
 * - inspiration https://alpinejs.dev/directives/cloak
 * - requires global css to be added
 * ```[data-cloak-target~='cloak'] { display: none !important; }```
 * - Goal is to make the simple case easy (just hide until JS is good to go)
 *   then make more nuanced cases possible without too much work
 *   (e.g. un-disable button when JS is ready)
 * - this could be added even to the root element globally for a really simple
 *   approach to hiding content until JS is loaded (just add the target)
 *   not sure on performance implications though
 *
 * Caveats
 * - Promise is probably a bit too slow but setTimeout may be too fast?
 * - This code does not actually know that something is connected, but can make
 * some assumptions
 *
 * Future
 * - Could provide other ways to 'hide' things by default that can work alongside
 *   the cloak target
 * - Phase - when disabled/display: none, visibility: hidden or others are set on
 *   the DOM attribute, when connected it will remove these attributes
 *   they can be 'backed up' on the element for re-phase later
 * - Stealth - similar to cloak but provides a way for the element to 'animate'
 *   into visibility when connected
 *
 */
class CloakController extends Controller {
  static targets = ['cloak', 'wait'];

  connect() {
    this.uncloak();
  }

  /**
   * Ensure we capture any additional cloak targets added dynamically within
   * this controller's scope.
   */
  cloakTargetConnected() {
    this.uncloak();
  }

  /**
   * Uncloaks any cloak targets by replacing the data-cloak-target 'cloak' with
   * 'uncloak'.
   *
   * Using a Promise to defer the uncloak so that we can be confident it
   * will run 'last' after any other controllers are connected. This may be too
   * slow and it might be best to use settimeout (but that may be too fast).
   *
   * HTML can also set a wait on the target that will NOT uncloak it unless
   * this method is called with an event that has a target of that element.
   *
   * This will also trigger `cloakTargetDisconnected` on this class
   * if we wanted to enhance behaviour.
   *
   * @param {Event?} event
   */
  uncloak(event = {}) {
    Promise.resolve().then(() => {
      const waitTargets = this.waitTargets;
      this.cloakTargets.forEach((element) => {
        if (waitTargets.includes(element) && element !== event.target) return;
        this.uncloakElement(element);
      });
    });
  }

  uncloakElement(element) {
    const targets = new TokenList(element.dataset.cloakTarget);
    targets.replace('cloak', 'uncloak');
    element.dataset.cloakTarget = targets.toString();
  }
}

export default CloakController;
