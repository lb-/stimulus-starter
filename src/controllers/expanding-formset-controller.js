import { Controller } from '@hotwired/stimulus';
import TokenList from '@wordpress/token-list';

class ExpandingFormset extends Controller {
  static classes = ['isMoving'];

  static values = {
    initial: { default: 0, type: Number },
    min: { default: 0, type: Number },
    max: { default: 1000, type: Number },
    total: { default: 0, type: Number },
  };

  static targets = ['addButton', 'container', 'deleted', 'item', 'template'];

  addItem() {
    this.containerTarget.appendChild(this.getNewPanelFromTemplate());
  }

  animateSwap(item1, item2) {
    const parent = self.formsUl;
    const children = parent.children('li:not(.deleted)');

    // Apply moving class to container (ul.multiple) so it can assist absolute positioning of it's children
    // Also set it's relatively calculated height to be an absolute one,
    // to prevent the container collapsing while its children go absolute
    this.element.classList.add(this.isMovingClass);
    this.element.style.height = this.element.height();

    this.itemTargets.forEach((item) => {
      item.style.top = item.position.top;
      item.classList.add(this.isMovingClass);
    });
    // .each(function moveChildTop() {
    //   $(this).css('top', $(this).position().top);
    // })
    // .addClass('moving');

    // animate swapping around
    item1.animate({ top: item2.position().top }, 200, () => {
      parent.removeClass('moving').removeAttr('style');
      children.removeClass('moving').removeAttr('style');
    });

    item2.animate({ top: item1.position().top }, 200, () => {
      parent.removeClass('moving').removeAttr('style');
      children.removeClass('moving').removeAttr('style');
    });
  }

  connect() {
    setTimeout(() => {
      this.update();
    });
  }

  itemTargetConnected() {
    this.update();
  }

  deletedTargetConnected() {
    this.update();
  }

  deleteItem({ target }) {
    const item = this.itemTargets.find((element) => element === target);
    const targetAttributeKey = `data-${this.identifier}-target`;
    const targets = new TokenList(item.getAttribute(targetAttributeKey));
    targets.add('deleted');
    item.setAttribute(targetAttributeKey, targets.toString());
  }

  moveItem({ target, detail: { moveUp } }) {
    const item = this.itemTargets.find((element) => element === target);
    console.log('moveItem', { item, moveUp });
  }

  update() {
    // update values and element state
    // always use the DOM as the source of truth where possible

    const total = this.itemTargets.length - this.deletedTargets.length;
    this.addButtonTarget.disabled = total >= this.maxValue;
    this.totalValue = total;

    this.itemTargets.forEach((target, index) => {
      this.dispatch('update', {
        detail: {
          index,
          maxValue: this.maxValue,
          minValue: this.minValue,
          total,
        },
        target,
      });
    });
  }

  getNewPanelFromTemplate() {
    const nextId = this.containerTarget.childElementCount + 1;
    const template = this.templateTarget;
    const newPanel = template.content.firstElementChild.cloneNode(true);
    newPanel.innerHTML = newPanel.innerHTML.replaceAll('__prefix__', nextId);
    return newPanel;
  }
}

export default ExpandingFormset;
