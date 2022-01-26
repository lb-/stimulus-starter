import { Application } from '@hotwired/stimulus';

import ExampleController from './example-controller';

describe('ExampleController', () => {
  document.body.innerHTML = `<h1 data-controller="example" id="header"></h1>`;

  const application = Application.start();
  application.register('example', ExampleController);

  it('should exist', () => {
    expect(ExampleController).toBeInstanceOf(Function);
  });

  it('should update the content of the controlled element', () => {
    expect(document.getElementById('header').textContent).toEqual('It works!');
  });
});
