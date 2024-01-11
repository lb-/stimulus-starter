import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static classes = ['closed', 'open'];
  static values = { closed: Boolean };
  static targets = ['content', 'toggle'];
}

// const getControllerData = (
//   element,
//   identifier,
//   getControllerForElementAndIdentifier = (..._) =>
//     window.Stimulus.getControllerForElementAndIdentifier(..._)
// ) => {
//   const controller = getControllerForElementAndIdentifier(element, identifier);
//   const { classes = [], targets = [], values = {} } = controller.constructor;
//   return {
//     classes: Object.fromEntries(
//       classes.map((key) => [key, controller[`${key}Classes`]])
//     ),
//     targets: Object.fromEntries(
//       targets.map((key) => [key, controller[`${key}Targets`]])
//     ),
//     values: Object.fromEntries(
//       Object.keys(values).map((key) => [key, controller[`${key}Value`]])
//     ),
//   };
// };

// // calling it
// getControllerData(document.getElementById('my-container'), 'reveal');
