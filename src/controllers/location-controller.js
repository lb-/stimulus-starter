import { Controller } from '@hotwired/stimulus';

class LocationController extends Controller {
  static targets = ['map'];

  mapTargetConnected(element) {
    console.log('mapTargetConnected', element);
    this.name = element.dataset.name;
  }

  add(event) {
    console.log('add', { event, name: this.name });
  }
}

export default LocationController;
