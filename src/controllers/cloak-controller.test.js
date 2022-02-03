import { Application } from '@hotwired/stimulus';

import CloakController from './cloak-controller';

describe('ExampleController', () => {
  document.body.innerHTML = `<h1 data-controller="init cloak" data-target="other cloak" id="header"></h1>`;

  const application = Application.start();
  application.register('cloak', CloakController);

  it('should load the the controlled element', () => {
    expect(document.getElementById('header').dataset.target).toEqual(
      'other cloak'
    );
  });

  it('should replace the target cloak value with uncloak at the next tick', (done) => {
    expect.assertions(1);
    Promise.resolve(true).then(() => {
      // cannot use async / await
      // this test is also just timing out
      expect(document.getElementById('header').dataset.target).toEqual(
        'other cloakx'
      );
      done();
    });
  });
});
