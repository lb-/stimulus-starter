import { Controller } from '@hotwired/stimulus';
import TokenList from '@wordpress/token-list';

const SELECTORS = {
  idInput: '[name$="-id"]',
  orderInput: '[name$="-ORDER"]',
  deleteInput: '[name$="-DELETE"]',
  moveUpButton: '[data-action$="#moveUp"]',
  moveDownButton: '[data-action$="#moveDown"]',
  deleteButton: '[data-action$="#delete"]',
};

class ExpandingFormset extends Controller {
  static classes = [
    'animate',
    'animateDeleted',
    'animateMoveUp',
    'animateMoveDown',
    'isDeleted',
    'isMoving',
  ];

  static values = {
    itemSelectors: { default: { ...SELECTORS }, type: Object },
    initial: { default: 0, type: Number },
    min: { default: 0, type: Number },
    max: { default: 1000, type: Number },
    noAnimate: { default: false, type: Boolean },
    total: { default: 0, type: Number },
  };

  static targets = ['addButton', 'container', 'deleted', 'item', 'template'];

  add() {
    const newItem = this.getNewItemFromTemplate();

    const event = this.dispatch('add', {
      cancelable: true,
      detail: { newItem },
    });

    if (event.defaultPrevented) return;

    this.containerTarget.appendChild(newItem);
  }

  connect() {
    this.itemTargets.forEach((item) => {
      item.refs = this.getItemRefs(item);
    });
  }

  getItemWithTarget(target) {
    const itemTargets = this.itemTargets;
    const index = itemTargets.findIndex((element) => element.contains(target));
    if (index === -1) return [null, -1];
    return [itemTargets[index], index];
  }

  getItemRefs(item) {
    // this will cause issues if the current formset does NOT allow deleting but a nested one does
    const querySelector = (selector) => item.querySelector(selector);

    // allow for default values inside object
    const selectors = { ...SELECTORS, ...this.itemSelectorsValue };

    return {
      idInput: querySelector(selectors.idInput),
      orderInput: querySelector(selectors.orderInput),
      deleteInput: querySelector(selectors.deleteInput),
      moveUpButton: querySelector(selectors.moveUpButton),
      moveDownButton: querySelector(selectors.moveDownButton),
      deleteButton: querySelector(selectors.deleteButton),
    };
  }

  getNewItemFromTemplate() {
    const nextId = this.containerTarget.childElementCount + 1;
    const template = this.templateTarget;
    const newPanel = template.content.firstElementChild.cloneNode(true);
    newPanel.innerHTML = newPanel.innerHTML.replaceAll('__prefix__', nextId);
    return newPanel;
  }

  itemTargetConnected(item) {
    item.refs = this.getItemRefs(item);

    this.update(() => {
      if (this.isMoving) return; // might be a nicer way to avoid this when moving
      this.dispatch('added', { cancelable: false, detail: { item } });
    });
  }

  itemTargetDisconnected(item) {
    console.log('item disconnected', { item, isMoving: this.isMoving });
    this.update(() => {
      if (this.isMoving) return; // might be a nicer way to avoid this when moving
      this.dispatch('deleted', { cancelable: false, detail: { item } });
    });
  }

  delete({ target }) {
    const [item, index] = this.getItemWithTarget(target);

    const event = this.dispatch('delete', {
      cancelable: true,
      detail: { index },
      target: item,
    });

    if (event.defaultPrevented) return;

    if (this.noAnimateValue) {
      item.classList.add(this.isDeletedClass);
    } else {
      // we may not want to animate deletion - it is a bit jarring

      const animateClass = this.animateClass;
      const animateDeleted = this.animateDeletedClass;

      item.style.position = 'relative';
      item.classList.add(animateClass);
      item.classList.add(animateDeleted);

      item.addEventListener(
        'animationend',
        () => {
          item.classList.add(this.isDeletedClass);
          item.classList.remove(animateClass);
          item.classList.remove(animateDeleted);

          delete item.style.position;
        },
        { capture: true, once: true, passive: true }
      );
    }

    const {
      moveUpButton,
      moveDownButton,
      deleteButton,
      deleteInput,
      orderInput,
    } = item.refs;

    // update inputs to reflect that this is deleted
    // TODO - if the item has been added client-side, we can just delete the DOM attribute (unless we want to provide undo)
    deleteInput.value = 1;
    if (moveUpButton) moveUpButton.disabled = true;
    if (moveDownButton) moveDownButton.disabled = true;
    if (deleteButton) deleteButton.disabled = true;
    if (orderInput) orderInput.value = -1;

    // update targets on item to remove 'item' and add 'deleted'

    const targetAttributeKey = `data-${this.identifier}-target`;

    const targets = new TokenList(
      item.getAttribute(`data-${this.identifier}-target`)
    );

    targets.add('deleted');
    targets.remove('item');

    item.setAttribute(targetAttributeKey, targets.toString());
  }

  moveUp({ target }) {
    const [item, index] = this.getItemWithTarget(target);
    if (index <= 0) return;

    const event = this.dispatch('moveUp', {
      cancelable: true,
      detail: { index },
      target: item,
    });

    if (event.defaultPrevented) return;

    const itemsToSwap = [item, this.itemTargets[index - 1]];

    this.transitionSwap(itemsToSwap);

    this.update(() => {
      this.dispatch('movedUp', {
        target: item,
        detail: { index, cancelable: false },
      });
    });
  }

  moveDown({ target }) {
    const [item, index] = this.getItemWithTarget(target);
    if (index >= this.totalValue - 1) return;

    const event = this.dispatch('moveDown', {
      cancelable: true,
      detail: { index },
      target: item,
    });

    if (event.defaultPrevented) return;

    const itemsToSwap = [this.itemTargets[index + 1], item];
    this.transitionSwap(itemsToSwap);

    this.update(() => {
      this.dispatch('movedUp', {
        target: item,
        detail: { index, cancelable: false },
      });
    });
  }

  transitionSwap(itemsToSwap) {
    this.isMoving = true;
    const isMovingClass = this.isMovingClass;
    this.element.classList.add(this.isMovingClass);

    // swap the actual DOM elements first
    this.containerTarget.insertBefore(...itemsToSwap);

    if (this.noAnimateValue) {
      this.isMoving = false;
      return;
    }

    const animateClass = this.animateClass;
    const animateMoveUp = this.animateMoveUpClass;
    const animateMoveDown = this.animateMoveDownClass;

    itemsToSwap.forEach((itemToSwap, index) => {
      // TODO - check if we can do this in bulk

      itemToSwap.classList.add(animateClass);
      itemToSwap.classList.add(index === 0 ? animateMoveUp : animateMoveDown);

      itemToSwap.addEventListener(
        'animationend',
        () => {
          this.element.classList.remove(isMovingClass);
          itemToSwap.classList.remove(animateClass);
          itemToSwap.classList.remove(animateMoveUp);
          itemToSwap.classList.remove(animateMoveDown);
          this.isMoving = false;
        },
        { capture: true, once: true, passive: true }
      );
    });
  }

  update(afterUpdateFn = null) {
    const minValue = this.minValue;
    const total = this.itemTargets.length;

    // update main controller values and state
    this.totalValue = total;
    this.addButtonTarget.disabled = total >= this.maxValue;

    this.itemTargets.forEach((item, index) => {
      const { moveUpButton, moveDownButton, deleteButton, orderInput } =
        item.refs;

      // update inner input values & button states
      if (orderInput) orderInput.value = index + 1;
      if (moveUpButton) moveUpButton.disabled = index === 0;
      if (moveDownButton) moveDownButton.disabled = index === total - 1;
      if (deleteButton) deleteButton.disabled = total <= minValue;
    });

    afterUpdateFn && setTimeout(afterUpdateFn);
  }
}

export default ExpandingFormset;
