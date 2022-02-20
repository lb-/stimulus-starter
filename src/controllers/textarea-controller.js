import { Controller } from '@hotwired/stimulus';

// https://github.com/jackmoore/autosize/blob/master/src/autosize.js

class TextareaController extends Controller {
  static values = {
    cachedHeight: { default: 0, type: Number },
    clientWidth: { default: 0, type: Number },
    heightOffset: { default: 0, type: Number },
  };

  connect() {
    const ta = this.element;

    if (ta.nodeName !== 'TEXTAREA') {
      throw new Error(`${this.identifier} must be set on a textarea element.`);
    }

    const style = window.getComputedStyle(ta, null);

    if (style.resize === 'vertical') {
      ta.style.resize = 'none';
    } else if (style.resize === 'both') {
      ta.style.resize = 'horizontal';
    }

    if (style.boxSizing === 'content-box') {
      this.heightOffsetValue = -(
        parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
      );
    } else {
      this.heightOffsetValue =
        parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    }

    // Fix when a textarea is not on document body and heightOffset is Not a Number
    if (isNaN(this.heightOffsetValue)) {
      this.heightOffsetValue = 0;
    }

    this.update();
  }

  changeOverflow(value) {
    const ta = this.element;

    {
      // Chrome/Safari-specific fix:
      // When the textarea y-overflow is hidden, Chrome/Safari do not reflow the text to account for the space
      // made available by removing the scrollbar. The following forces the necessary text reflow.
      const width = ta.style.width;
      ta.style.width = '0px';
      // Force reflow:
      /* jshint ignore:start */
      ta.offsetWidth;
      /* jshint ignore:end */
      ta.style.width = width;
    }

    ta.style.overflowY = value;
  }

  getParentOverflows() {
    let el = this.element;
    const arr = [];

    while (el && el.parentNode && el.parentNode instanceof Element) {
      if (el.parentNode.scrollTop) {
        arr.push({
          node: el.parentNode,
          scrollTop: el.parentNode.scrollTop,
        });
      }
      el = el.parentNode;
    }

    return arr;
  }

  resize() {
    const ta = this.element;

    if (ta.scrollHeight === 0) {
      // If the scrollHeight is 0, then the element probably has display:none or is detached from the DOM.
      return;
    }

    const overflows = this.getParentOverflows(ta);
    const docTop =
      document.documentElement && document.documentElement.scrollTop; // Needed for Mobile IE (ticket #240)

    ta.style.height = '';
    ta.style.height = ta.scrollHeight + this.heightOffsetValue + 'px';

    // used to check if an update is actually necessary on window.resize
    this.clientWidthValue = ta.clientWidth;

    // prevents scroll-position jumping
    overflows.forEach((el) => {
      el.node.scrollTop = el.scrollTop;
    });

    if (docTop) {
      document.documentElement.scrollTop = docTop;
    }
  }

  pageResize() {
    const ta = this.element;
    if (ta.clientWidth !== this.clientWidthValue) {
      this.update();
    }
  }

  update() {
    this.resize();

    const cachedHeight = this.cachedHeightValue;

    const ta = this.element;

    const styleHeight = Math.round(parseFloat(ta.style.height));
    const computed = window.getComputedStyle(ta, null);

    // Using offsetHeight as a replacement for computed.height in IE, because IE does not account use of border-box
    var actualHeight =
      computed.boxSizing === 'content-box'
        ? Math.round(parseFloat(computed.height))
        : ta.offsetHeight;

    // The actual height not matching the style height (set via the resize method) indicates that
    // the max-height has been exceeded, in which case the overflow should be allowed.
    if (actualHeight < styleHeight) {
      if (computed.overflowY === 'hidden') {
        this.changeOverflow('scroll');
        this.resize();
        actualHeight =
          computed.boxSizing === 'content-box'
            ? Math.round(parseFloat(window.getComputedStyle(ta, null).height))
            : ta.offsetHeight;
      }
    } else {
      // Normally keep overflow set to hidden, to avoid flash of scrollbar as the textarea expands.
      if (computed.overflowY !== 'hidden') {
        this.changeOverflow('hidden');
        this.resize();
        actualHeight =
          computed.boxSizing === 'content-box'
            ? Math.round(parseFloat(window.getComputedStyle(ta, null).height))
            : ta.offsetHeight;
      }
    }

    if (cachedHeight !== actualHeight) {
      this.cachedHeightValue = actualHeight;
      this.dispatch('resized');
    }
  }
}

export default TextareaController;
