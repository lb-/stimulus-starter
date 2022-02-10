import { Controller } from '@hotwired/stimulus';

class TabsController extends Controller {
  connect() {
    setTimeout(() => {
      console.log('ready to show my content!');
      this.dispatch('ready');
    }, 2000);
  }
}

export default TabsController;
