import { Controller } from '@hotwired/stimulus';
import InfiniteScroll from 'infinite-scroll';

class InfiniteScrollController extends Controller {
  static get targets() {
    return ['next', 'grid', 'footer', 'item'];
  }

  connect() {
    let infScroll;

    if (this.hasNextTarget) {
      infScroll = new InfiniteScroll(this.gridTarget, {
        path: '.next_page a',
        append: '[data-infinite-scroll-target="item"]',
        // append: `.${this.data.get("object")}-top-level`,
        scrollThreshold: false,
        status: '.page-load-status',
        button: '.view-more-button',
      });

      this.footerTarget.querySelector('.view-more-button').style.display =
        'inline-flex';
    } else {
      this.footerTarget.querySelector('.view-more-button').style.display =
        'none';
    }

    // When new content is appended, re-layout the gallery to ensure new photos position correctly
    if (infScroll) {
      infScroll.on('append', (event, response, path, items) => {
        // note: the 'event' here is the jQuery event, the dispatch below will also dispatch with its own event
        // passing the original jQuery event (which is not strictly a DOM event) in the detail as it may be used

        const detail = { event, response, path, items };

        this.dispatch('append', {
          cancelable: false,
          detail,
          target: event.target,
        });
      });
    }
  }
}

export default InfiniteScrollController;
