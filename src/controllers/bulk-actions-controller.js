import { Controller } from '@hotwired/stimulus';

/**
 * Port of client/src/entrypoints/admin/bulk-actions.js
 *
 * Missing functionality
 * - 'has other pages' logic for different translation (could be a value)
 *
 * Added functionality
 * - Translation supports 0/1/2 or more pluralisation (via array) however should look at Locale instead
 * - Translations can be added in the HTML (not a global JS object)
 * - 'hidden' and 'has-selection' class can be defined in the HTML instead of hardcoded
 * - no need for rebindBulkActionsEventListeners as this is handled by the framework (including on search results and any other html changes, including adding rows dynamically)
 * - 'bulk-actions:total-selected-changed' event will be fired when the value changes (dispatched from the controlled element)
 * - multiple elements can be supplied as disabled/display: none from HTML and then easily shown/enabled when 'setup' has finished
 */
class BulkActionsController extends Controller {
  static classes = [
    /** applies to the container once any selection is made, is removed when no selection */
    'hasSelection',
    /** applies to the summary target when there is NO selection */
    'summaryHidden',
  ];

  static targets = [
    'action',
    'allItems',
    'item',
    'label',
    'summary',
    'uncloak',
  ];

  static values = {
    labelTranslation: Array,
    parentId: Number,
  };

  connect() {
    this.updateTotalSelected();

    this.uncloakTargets.map((element) => {
      // once initialised - uncloak any elements
      // this still requires the HTML to add a display: none; for load time (or disabled)
      // could be a convention or could be something done in the base controller
      // this could create issues with multiple behaviours that do this though where the same targets need to be uncloaked by different controllers
      if (element.disabled) element.disabled = false;
      element.style.setProperty('display', 'initial');
    });
  }

  getLabelTranslatedValue(totalSelected) {
    const labelTranslationValue = this.labelTranslationValue;

    const translationIndex =
      totalSelected >= labelTranslationValue.length
        ? labelTranslationValue.length - 1
        : totalSelected;

    return labelTranslationValue[translationIndex].replace(
      '{0}',
      totalSelected
    );
  }

  getSelectedTotals() {
    const totalSelected = this.itemTargets.reduce(
      (total, element) => total + Number(element.checked),
      0
    );

    const isAllSelected = totalSelected === this.itemTargets.length;

    return { isAllSelected, totalSelected };
  }

  getUrlParams() {
    const { isAllSelected } = this.getSelectedTotals();
    const parentId = this.parentIdValue;
    const urlParams = new URLSearchParams(window.location.search);

    if (isAllSelected) {
      urlParams.append('id', 'all');
      if (parentId) urlParams.append('childOf', parentId);
    } else {
      this.itemTargets.forEach((element) => {
        if (!element.checked) return;
        urlParams.append('id', element.dataset.objectId);
      });
    }

    return urlParams;
  }

  itemTargetConnected() {
    this.updateTotalSelected();
  }

  itemTargetDisconnected() {
    this.updateTotalSelected();
  }

  toggleAll(event) {
    const isChecked = event.target.checked;
    this.itemTargets.forEach((element) => (element.checked = isChecked));
    this.updateTotalSelected();
  }

  toggleItem() {
    this.updateTotalSelected();
  }

  updateTotalSelected() {
    const { isAllSelected, totalSelected } = this.getSelectedTotals();

    // update 'select all items' checkboxes so they are in sync
    this.allItemsTargets.forEach((checkbox) => {
      checkbox.checked = isAllSelected;
    });

    // update classes

    if (totalSelected) {
      this.element.classList.add(this.hasSelectionClass);
      this.summaryTarget.classList.remove(this.summaryHiddenClass);
    } else {
      this.element.classList.remove(this.hasSelectionClass);
      this.summaryTarget.classList.add(this.summaryHiddenClass);
    }

    // update content

    this.labelTarget.innerText = this.getLabelTranslatedValue(totalSelected);

    this.dispatch('total-selected-changed', {
      detail: { isAllSelected, totalSelected },
    });

    this.actionTargets.forEach((element) => {
      // backup href to dataset.baseUrl if not already done
      if (!element.dataset.url) {
        element.setAttribute('data-url', element.getAttribute('href'));
      }

      const url = element.dataset.url;
      const urlParams = this.getUrlParams(element).toString();
      element.setAttribute('href', urlParams ? `${url}&${urlParams}` : url);
    });
  }
}

export default BulkActionsController;
