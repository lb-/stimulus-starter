import { Controller } from '@hotwired/stimulus';

class IdeaController extends Controller {
  static targets = ['log'];

  initialize() {
    this.application.registerActionOption(
      'outside',
      function ({ element, event, value }) {
        const isInside = element.contains(event.target);
        return value ? !isInside : isInside;
      }
    );

    this.application.registerActionOption(
      'limit',
      ({
        element,
        event,
        pause = ((value) => !(value == '0' || value == 'false'))(
          element.dataset.limitPaused || 'false'
        ),
        timer = Number(element.dataset.limitTimer),
        wait = Number(element.dataset.limitDelay || '500'),
      }) => {
        console.log('pause', pause);
        clearTimeout(timer);
        delete element.dataset.limitTimer;

        if (event.__isDebounced) {
          delete event.__isDebounced;
          return true;
        }

        element.dataset.limitTimer = setTimeout(() => {
          event.__isDebounced = true;
          element.dispatchEvent(event);
        }, wait);

        return false;
      }
    );

    this.application.registerActionOption(
      'debounce',
      ({
        element,
        event,
        wait = Number(element.dataset.debounce || '500'),
      }) => {
        clearTimeout(element._debounceTimer);

        if (event._isDebounced) {
          delete event._isDebounced;
          return true;
        }

        element._debounceTimer = setTimeout(() => {
          event._isDebounced = true;
          element.dispatchEvent(event);
        }, wait);

        return false;
      }
    );

    ['alt', 'ctrl', 'meta'].forEach((key) => {
      this.application.registerActionOption(
        key,
        ({ event, value, keyPressed = event[`${key}Key`] }) =>
          value ? keyPressed : !keyPressed
      );
    });

    // this.application.registerActionOption('alt', ({ event, value }) => {
    //   return value ? event.altKey : !event.altKey;
    // });
    // this.application.registerActionOption('ctrl', ({ event, value }) =>
    //   value ? event.ctrlKey : !event.ctrlKey
    // );
    // this.application.registerActionOption('meta', ({ event, value }) => {
    //   return value ? event.metaKey : !event.metaKey;
    // });
  }

  connect() {
    setTimeout(() => {
      console.log('ready to show my content!');
      this.dispatch('ready');
    }, 2000);
  }

  action(event) {
    console.log('action clicked', event);
  }

  search({ target }) {
    const li = document.createElement('li');
    li.innerText = target.value;
    this.logTarget.append(li);
  }
}

export default IdeaController;
