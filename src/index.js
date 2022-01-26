import { Application } from '@hotwired/stimulus';
import { definitionsFromContext } from '@hotwired/stimulus-webpack-helpers';

const application = Application.start();
// eslint-disable-next-line no-undef
const context = require.context('./controllers', true, /(?<!\.test)\.js$/);

application.load(definitionsFromContext(context));
