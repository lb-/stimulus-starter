# Stimulus Starter

A preconfigured blank slate for exploring [Stimulus](https://github.com/hotwired/stimulus). Jump to [The Stimulus Handbook](https://stimulus.hotwired.dev/handbook/introduction) for an introduction.

---

We recommend [remixing `stimulus-starter` on Glitch](https://glitch.com/edit/#!/import/git?url=https://github.com/hotwired/stimulus-starter.git) so you can work entirely in your browser without installing anything:

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/import/git?url=https://github.com/hotwired/stimulus-starter.git)

Or, if you'd prefer to work from the comfort of your own text editor, you'll need to clone and set up `stimulus-starter`:

```
$ git clone https://github.com/hotwired/stimulus-starter.git
$ cd stimulus-starter
$ yarn install
$ yarn start
```

## Notes

Some useful things

## `this.identifier` - available on controller class instance

- this will be the registered controller's identifier (used when registering)

### `this.dispatch` - additional params

- https://github.com/hotwired/stimulus/blob/main/src/core/controller.ts#L64
- `target` - defaults to the controlled element but can be given anything that a dispatched event can be fired from (e.g. another element)
- `prefix` - best not to override but good to know it can be done
- `bubbles` - see MDN
- `cancelable` - see MDN
- Important - it returns the event, NOT the result of the dispatch (actually more useful but good to know if you want to handle preventDefault cases)
