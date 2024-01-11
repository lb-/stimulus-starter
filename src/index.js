import { Application } from '@hotwired/stimulus';
import { definitionsFromContext } from '@hotwired/stimulus-webpack-helpers';

const application = Application.start();
application.debug = true;

// eslint-disable-next-line no-undef
const context = require.context('./controllers', true, /(?<!\.test)\.js$/);

application.load(definitionsFromContext(context));

window.Stimulus = application;
