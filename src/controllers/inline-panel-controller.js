import { Controller } from '@hotwired/stimulus';
import TokenList from '@wordpress/token-list';

const INNER_TARGETS = [
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
    'undoDeleteButton',
    // item main targets
    'item',
    'deleted',
    'template',
    ...INNER_TARGETS,
  ];

  add() {
    const maxValue = this.maxValue;
    const total = this.itemTargets.length;

    if (total + 1 > maxValue) return;

    const newItem = this.getNewItemFromTemplate();

    const event = this.dispatch('add', {
      cancelable: true,
      detail: { newItem },
    });

    if (event.defaultPrevented) return;

    const item = this.containerTarget.appendChild(newItem);

    item.refs = this.getItemRefs(item);

    this.update(() => {
      this.dispatch('added', { cancelable: false, detail: { item } });
    });
  }

  connect() {
    this.itemTargets.forEach((item) => {
      item.refs = this.getItemRefs(item);
    });

    this.update(() => {
      this.dispatch('connected', { cancelable: false });
    });
  }

  getItemWithTarget(target) {
    const itemTargets = this.itemTargets;
    const index = itemTargets.findIndex((element) => element.contains(target));
    if (index === -1) return [null, -1];
    return [itemTargets[index], index];
  }

  getInnerTargets(item, name) {
    return (this[`${name}Targets`] || []).filter((element) =>
      item.contains(element)
    );
  }

  getItemRefs(item) {
    return Object.fromEntries(
      INNER_TARGETS.map((name) => {
        const innerTargets = this.getInnerTargets(item, name);
        const isInput = name.includes('input');
        return [name, isInput ? innerTargets[0] || null : innerTargets];
      })
    );
  }

  getNewItemFromTemplate() {
    const nextId = this.containerTarget.childElementCount + 1;
    const template = this.templateTarget;
    const newPanel = template.content.firstElementChild.cloneNode(true);
    newPanel.innerHTML = newPanel.innerHTML.replaceAll('__prefix__', nextId);
    return newPanel;
  }

  getUndoDeletedQueue() {
    return this.deletedTargets
      .map((item) => item.dataset.deletedOn)
      .filter((val) => val)
      .sort();
  }

  deletedTargetConnected(item) {
    item.refs = this.getItemRefs(item);

    // add a date to help track for undo
    const deletedOn = new Date().toISOString();
    item.dataset.deletedOn = deletedOn;

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
      // this.undoMoveValue = ['movedUp', item.refs.idInput[0].value];
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
      // this.undoMoveValue = ['movedUp', item.refs.idInput[0].value];
      this.dispatch('movedUp', {
        target: item,
        detail: { index, cancelable: false },
      });
    });
  }

  transitionSwap(itemsToSwap) {
    const isMovingClass = this.isMovingClass;
    this.element.classList.add(this.isMovingClass);

    // swap the actual DOM elements first
    this.containerTarget.insertBefore(...itemsToSwap);

    if (this.noAnimateValue) return;

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
        },
        { capture: true, once: true, passive: true }
      );
    });
  }

  undoDelete() {
    const maxValue = this.maxValue;
    const total = this.totalValue;

    const canAdd = total < maxValue;
    const undoDeletes = canAdd ? this.getUndoDeletedQueue() : [];
    const canUndo = undoDeletes.length > 0;
    const deletedOn = undoDeletes[0];

    const item = this.deletedTargets.find(
      (deletedItem) => deletedItem.dataset.deletedOn === deletedOn
    );

    if (!deletedOn || !canUndo || !item) return;

    const event = this.dispatch('add', {
      cancelable: true,
      detail: { index: null, isUndo: true },
      target: item,
    });

    if (event.defaultPrevented) return;

    // update targets on item to add 'item' and remove 'deleted'

    const targetAttributeKey = `data-${this.identifier}-target`;

    const targets = new TokenList(
      item.getAttribute(`data-${this.identifier}-target`)
    );

    targets.add('item');
    targets.remove('deleted');

    item.setAttribute(targetAttributeKey, targets.toString());

    this.containerTarget.appendChild(item);
    item.classList.remove(this.isDeletedClass);

    item.refs = this.getItemRefs(item);

    this.update(() => {
      this.dispatch('added', {
        cancelable: false,
        detail: { item, isUndo: true },
      });
    });
  }

  update(afterUpdateFn = null) {
    const minValue = this.minValue;
    const maxValue = this.maxValue;
    const total = this.itemTargets.length;

    // update main controller values and state
    this.totalValue = total;
    const canAdd = total < maxValue;
    const canRemove = total > minValue;

    this.addButtonTargets.forEach((addButton) => {
      addButton.disabled = !canAdd;
    });

    // update inner input values & button states
    this.itemTargets.forEach((item, index) => {
      const { moveUpButton, moveDownButton, deleteButton, orderInput } =
        item.refs;

      if (this.canOrderValue) {
        const canMoveUp = index === 0;
        const canMoveDown = index === total - 1;

        orderInput.value = index + 1;

        moveUpButton.forEach((button) => {
          button.disabled = canMoveUp;
        });

        moveDownButton.forEach((button) => {
          button.disabled = canMoveDown;
        });
      }

      if (this.canDeleteValue) {
        deleteButton.forEach((button) => (button.disabled = !canRemove));
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
      deleteButton.forEach((button) => {
        button.disabled = true;
      });

      // disable other buttons for ordering
      if (this.canOrderValue) {
        orderInput.value = -1;

        moveUpButton.forEach((button) => {
          button.disabled = true;
        });
        moveDownButton.forEach((button) => {
          button.disabled = true;
        });
      }
    });

    const undoDeletes = canAdd ? this.getUndoDeletedQueue() : [];
    const canUndo = undoDeletes.length > 0;

    this.undoDeleteButtonTargets.forEach((button) => {
      button.disabled = !canUndo;
    });

    afterUpdateFn && afterUpdateFn();
  }
}

export default InlinePanel;
