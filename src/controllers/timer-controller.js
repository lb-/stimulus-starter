import { Controller } from '@hotwired/stimulus';

const BEFORE = 'BEFORE';
const DURING = 'DURING';
const AFTER = 'AFTER';

export default class extends Controller {
  static values = {
    interval: { default: 500, type: Number },
    locale: { default: 'en-GB', type: String },
    from: String,
    to: String,
  };

  static targets = ['before', 'during', 'after', 'fromTime', 'toTime'];

  connect() {
    this._timer = setInterval(() => {
      this.update();
    }, this.intervalValue);

    this.setTimeValues();
    this.update();
  }

  getTimeData() {
    const from = this.hasFromValue && new Date(this.fromValue);
    const to = this.hasToValue && new Date(this.toValue);

    if (!from || !to) return;
    if (from > to) {
      throw new Error('From time must be after to time.');
    }

    const now = new Date();

    const status = (() => {
      if (now < from) return BEFORE;

      if (now >= from && now <= to) return DURING;

      return AFTER;
    })();

    return { from, to, status };
  }

  setTimeValues() {
    const { from, to } = this.getTimeData();

    const formatter = new Intl.DateTimeFormat(this.localeValue, {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    this.fromTimeTargets.forEach((element) => {
      element.setAttribute('datetime', from);
      element.innerText = formatter.format(from);
    });

    this.toTimeTargets.forEach((element) => {
      element.setAttribute('datetime', to);
      element.innerText = formatter.format(to);
    });
  }

  update() {
    const { status } = this.getTimeData();

    [
      [BEFORE, this.beforeTarget],
      [DURING, this.duringTarget],
      [AFTER, this.afterTarget],
    ].forEach(([key, element]) => {
      if (key === status) {
        element.style.removeProperty('display');
      } else {
        element.style.setProperty('display', 'none');
      }
    });
  }

  disconnect() {
    // ensure we clean up so the timer is not running if the element gets removed

    clearInterval(this._timer);
  }
}
