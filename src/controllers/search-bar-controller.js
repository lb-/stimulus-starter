import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static classes = ['hidden'];
  static targets = ['menuCard'];

  connect() {}

  clear() {
    this.menuCardTargets.forEach((menuCard) => {
      menuCard.classList.remove('hidden');
    });
  }

  search(event) {
    console.log(event);
    const searchInput = event.target.value.toLowerCase(); // assigns the value of the text in the input field

    this.menuCardTargets.forEach((menuCard) => {
      const itemName = menuCard
        .querySelector('.item-name')
        .textContent.toLowerCase();

      if (itemName.includes(searchInput)) {
        // if the name of the menu item is the same as whatever is inputted in the search field
        menuCard.classList.remove('hidden'); // display the menu card of the menu item
      } else {
        menuCard.classList.add('hidden'); // hide the menu card of all the items that do not match the input
      }
    });
  }
}
