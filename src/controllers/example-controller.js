import { Controller } from '@hotwired/stimulus';

/**
 * A sidebar (expanding menu).
 */
class Sidebar extends Controller {
  connect() {
    // ...
  }

  toggle() {
    const isExpanded = !!this.element.getAttribute('aria-expanded');
    this.element.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
  }
}

/**
 * A button which will toggle another sidebar elsewhere in the DOM.
 */
class SidebarToggle extends Controller {
  connect() {
    this.sidebar = document.getElementById(
      this.element.getAttribute('aria-controls')
    );

    if (!this.sidebar && this.application.debug) {
      console.error('should find a matching sidebar');
    }
  }

  toggle() {
    this.dispatch('toggle', { target: this.sidebar });
  }
}

export { Sidebar, SidebarToggle };
