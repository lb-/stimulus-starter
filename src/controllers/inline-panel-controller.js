import { Controller } from '@hotwired/stimulus';

class InlinePanel extends Controller {
  static classes = ['isDeleted', 'isMoving'];

  static targets = [
    'copyButton',
    'deleteButton',
    'deleteInput',
    'moveDownButton',
    'moveUpButton',
    'orderInput',
  ];

  delete() {
    if (!this.hasDeleteInputTarget) return;
    this.element.classList.add(this.isDeletedClass);
    this.deleteInputTarget.value = '1';
    this.dispatch('deleted');
  }

  move({
    detail: { isMoveEnd = false } = {},
    params: { moveUp = false } = {},
  }) {
    if (!this.hasOrderInput) return;

    if (isMoveEnd) {
      // might not need this
      this.element.classList.remove(this.isMovingClass);
      return;
    }

    const orderInput = this.orderInputTarget;
    const currentOrder = Number(orderInput.value);

    if (moveUp && currentOrder <= 0) {
      orderInput.value = currentOrder - 1;
    }

    if (!moveUp) {
      orderInput.value = currentOrder + 1;
    }

    this.dispatch('moved', { detail: { moveUp } });
  }

  update({ detail: { index, maxValue, minValue, total } } = {}) {
    console.log('update', { index, maxValue, minValue, total });
    if (this.hasMoveUpButtonTarget)
      this.moveUpButtonTarget.disabled = index === 0;
    if (this.hasMoveDownButtonTarget)
      this.moveDownButtonTarget.disabled = index === total - 1;
    if (this.hasCopyButtonTarget)
      this.copyButtonTarget.disabled = total >= maxValue;
    if (this.hasDeleteButtonTarget)
      this.deleteButtonTarget.disabled = total <= minValue;
  }
}

export default InlinePanel;
