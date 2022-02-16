import { Controller } from '@hotwired/stimulus';
import TokenList from '@wordpress/token-list';

const INNER_TARGETS = [
  'idInput',
  'orderInput',
  'deleteInput',
  'moveUpButton',
  'moveDownButton',
  'deleteButton',
];

/**
 * Exposes events for all main behaviour (add/added delete/deleted moveUp/movedUp moveDown/movedDown)
 * Provides the ability to customise animations via data classes
 * All behaviour can be controlled on a granular level (e.g. delete button can be anywhere)
 *
 * TODO - Global error message removal (although, that could be an event listener?)
 * TODO - validate nested inline panels
 * TODO - explore how existing initChild can be ported
 */
class InlinePanel extends Controller {
  static classes = [
    'animate',
    'animateDeleted',
    'animateMoveUp',
    'animateMoveDown',
    'isDeleted',
    'isMoving',
  ];

  static values = {
    canDelete: { default: false, type: Boolean },
    canOrder: { default: false, type: Boolean },
    initial: { default: 0, type: Number },
    min: { default: 0, type: Number },
    max: { default: 1000, type: Number },
    noAnimate: { default: false, type: Boolean },
    total: { default: 0, type: Number },
  };

  static targets = [
    'addButton',
    'container',
    // item main targets
    'item',
    'deleted',
    'template',
    ...INNER_TARGETS,
  ];

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

    this.dispatch('connected', { cancelable: false });
  }

  getItemWithTarget(target) {
    const itemTargets = this.itemTargets;
    const index = itemTargets.findIndex((element) => element.contains(target));
    if (index === -1) return [null, -1];
    return [itemTargets[index], index];
  }

  getItemRefs(item) {
    const getInnerTarget = (name) =>
      (this[`${name}Targets`] || []).find((element) =>
        item.contains(element)
      ) || null;

    return Object.fromEntries(
      INNER_TARGETS.map((name) => [name, getInnerTarget(name)])
    );
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

  deletedTargetConnected(item) {
    item.refs = this.getItemRefs(item);

    this.update(() => {
      this.dispatch('deleted', { cancelable: false, detail: { item } });
    });

    // TODO - hide / remove any deleted errors
    /* Hide container on page load if it is marked as deleted. Remove the error
     message so that it doesn't count towards the number of errors on the tab at the
     top of the page. */
    // $('#' + childId).find('.error-message').remove();
  }

  delete({ target }) {
    const [item, index] = this.getItemWithTarget(target);

    if (!item || !this.canDeleteValue) return;

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

      item.classList.add(animateClass);
      item.classList.add(animateDeleted);

      item.addEventListener(
        'animationend',
        () => {
          item.classList.add(this.isDeletedClass);
          item.classList.remove(animateClass);
          item.classList.remove(animateDeleted);
        },
        { capture: true, once: true, passive: true }
      );
    }

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

    if (!item || index <= 0 || !this.canOrderValue) return;

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

    if (!item || index >= this.totalValue - 1 || !this.canOrderValue) return;

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

      itemToSwap.classList.add(isMovingClass);
      itemToSwap.classList.add(animateClass);
      itemToSwap.classList.add(index === 0 ? animateMoveUp : animateMoveDown);

      itemToSwap.addEventListener(
        'animationend',
        () => {
          this.element.classList.remove(isMovingClass);
          itemToSwap.classList.remove(isMovingClass);
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
    const maxValue = this.maxValue;
    const total = this.itemTargets.length;

    // update main controller values and state
    this.totalValue = total;
    this.addButtonTarget.disabled = total >= maxValue;

    // update inner input values & button states
    this.itemTargets.forEach((item, index) => {
      const { moveUpButton, moveDownButton, deleteButton, orderInput } =
        item.refs;

      if (this.canOrderValue) {
        if (orderInput) orderInput.value = index + 1;
        if (moveUpButton) moveUpButton.disabled = index === 0;
        if (moveDownButton) moveDownButton.disabled = index === total - 1;
      }

      if (this.canDeleteValue) {
        if (deleteButton) deleteButton.disabled = total <= minValue;
      }
    });

    this.deletedTargets.forEach((item) => {
      const {
        moveUpButton,
        moveDownButton,
        deleteButton,
        deleteInput,
        orderInput,
      } = item.refs;

      // update inputs to reflect that this is deleted
      deleteInput.value = 1;
      if (deleteButton) deleteButton.disabled = true;

      // disable other buttons for ordering
      if (this.canOrderValue) {
        if (moveUpButton) moveUpButton.disabled = true;
        if (moveDownButton) moveDownButton.disabled = true;
        if (orderInput) orderInput.value = -1;
      }
    });

    afterUpdateFn && setTimeout(afterUpdateFn);
  }
}

export default InlinePanel;
