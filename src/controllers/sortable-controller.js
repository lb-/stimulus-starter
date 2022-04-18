import { Controller } from '@hotwired/stimulus';
import Sortable from 'sortablejs';

/**
 *
 * Default options https://github.com/SortableJS/Sortable/blob/master/src/Sortable.js#L359-L397
 *
 */
export default class extends Controller {
  static classes = ['chosen', 'drag', 'ghost'];

  static targets = ['sort'];

  static values = {
    animation: { default: 0, type: Number },
    disabled: { default: false, type: Boolean },
    draggable: String,
    fallbackOnBody: { default: false, type: Boolean },
    group: String,
    handle: String,
    invertSwap: { default: false, type: Boolean },
    removeCloneOnHide: { default: true, type: Boolean },
    sort: { default: true, type: Boolean },
    swapThreshold: { default: 1, type: Number },
  };

  connect() {
    this._sortable = Sortable.create(this.sortTarget, this.getOptions());
  }

  getOptions() {
    // values - with defaults
    const options = {
      animation: this.animationValue,
      disabled: this.disabledValue,
      fallbackOnBody: this.fallbackOnBodyValue,
      removeCloneOnHide: this.removeCloneOnHideValue,
      sort: this.sortValue,
      swapThreshold: this.swapThresholdValue,

      onChoose: (event) => this._adaptEvent(event),
      onStart: (event) => this._adaptEvent(event),
      onEnd: (event) => this._adaptEvent(event),
      onAdd: (event) => this._adaptEvent(event),
      onUpdate: (event) => this._adaptEvent(event),
      onSort: (event) => this._adaptEvent(event),
      onRemove: (event) => this._adaptEvent(event),
      onChange: (event) => this._adaptEvent(event),
      onUnchoose: (event) => this._adaptEvent(event),
      // onChoose: (detail) =>
      //   this.dispatch('choose', { bubbles: false, cancelable: false, detail }),
      // onStart: (detail) =>
      //   this.dispatch('start', { bubbles: false, cancelable: false, detail }),
      // onEnd: (detail) =>
      //   this.dispatch('end', { bubbles: false, cancelable: false, detail }),
      // onAdd: (detail) =>
      //   this.dispatch('add', { bubbles: false, cancelable: false, detail }),
      // onUpdate: (detail) =>
      //   this.dispatch('update', { bubbles: false, cancelable: false, detail }),
      // onSort: (detail) =>
      //   this.dispatch('sort', { bubbles: false, cancelable: false, detail }),
      // onRemove: (detail) =>
      //   this.dispatch('remove', { bubbles: false, cancelable: false, detail }),
      // onChange: (detail) =>
      //   this.dispatch('change', { bubbles: false, cancelable: false, detail }),
      // onUnchoose: (detail) =>
      //   this.dispatch('unchoose', {
      //     bubbles: false,
      //     cancelable: false,
      //     detail,
      //   }),
    };

    // values - do not want to set unless actually provided
    if (this.hasDraggableValue) options.draggable = this.draggableValue;
    if (this.hasGroupValue) options.group = this.groupValue;
    if (this.hasHandleValue) options.handle = this.handleValue;

    // classes (only set if provided)
    if (this.hasGhostClass) options.ghostClass = this.ghostClass;
    if (this.hasChosenClass) options.chosenClass = this.chosenClass;
    if (this.hasDragClass) options.dragClass = this.dragClass;

    return options;
  }

  log(event) {
    console.log(event);
  }

  _adaptEvent(event) {
    // 'event': name,
    // 'this': this,
    // 'item': evt.item,
    // 'from': evt.from,
    // 'to': evt.to,
    // 'oldIndex': evt.oldIndex,
    // 'newIndex': evt.newIndex
    const { event: name, item, from, to, oldIndex, newIndex } = event;
    event.name = {
      onChoose: `${this.identifier}:choose`,
      onStart: `${this.identifier}:start`,
      onEnd: `${this.identifier}:end`,
      onAdd: `${this.identifier}:add`,
      onUpdate: `${this.identifier}:update`,
      onSort: `${this.identifier}:sort`,
      onRemove: `${this.identifier}:remove`,
      onChange: `${this.identifier}:change`,
      onUnchoose: `${this.identifier}:unchoose`,
    }[event.name];
    // event.detail = { item, from, to, oldIndex, newIndex };
    console.log('event', event);
    this.element.dispatchEvent(event);
  }
}
