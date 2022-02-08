import { Controller } from '@hotwired/stimulus';

class MenuController extends Controller {
  static targets = ['item', 'link', 'root'];

  connect() {
    if (this.hasRootTarget) {
      setTimeout(() => {
        // must use setTimeout to ensure any sub-menus are connected
        // alternative approach would be to fire a 'ready' like event on submenus
        console.log('main menu', this.getMenuStructure());
      });
    }
  }

  getMenuStructure() {
    const links = this.linkTargets;

    return this.itemTargets.map((item) => {
      const child = item.firstElementChild;
      const subMenu = this.application.getControllerForElementAndIdentifier(
        child,
        this.identifier
      );

      const menuLinks = links.filter((link) => item.contains(link));

      return subMenu ? subMenu.getMenuStructure() : menuLinks;
    });
  }
}

export default MenuController;
