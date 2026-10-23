import React from 'react';
import ReactDOM from 'react-dom';
import Main from './components/Main.js';
import { H5PContext } from './context/H5PContext.js';

/**
 * Initializes the Gamified Virtual Tour editor
 * @param {object} parent The parent widget
 * @param {object} field The semantics field of the content
 * @param {object} params The initial parameters of the content
 * @param {function} setValue Function to update the content parameters
 */
H5PEditor.widgets.gamifiedVirtualTour = H5PEditor.GamifiedVirtualTour = class GamifiedVirtualTour {
  constructor(parent, field, params, setValue) {
    this.params = params || {};
    this.params = Object.assign({
      scenes: [],
    }, this.params);
    this.parent = parent;
    this.field = field;
    this.setValue = setValue;
    this.wrapper = null;

    H5P.$window.on('resize', this.resize);
    this.resize();
  }

  /**
   * Help fetch the correct translations.
   * @returns {string} The translated string
   */
  t() {
    const args = ['H5PEditor.GamifiedVirtualTour'];
    for (let i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    return H5PEditor.t.apply(window, args);
  }

  appendTo($container) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('h5p-editor-gamified-virtual-tour-wrapper');
    this.wrapper = wrapper;

    $container[0].appendChild(wrapper);

    this.setValue(this.field, this.params);

    let startScene = this.params.scenes.length ? 0 : null;
    if (this.params.scenes.length) {
      startScene = this.params.startSceneId;
    }

    ReactDOM.render(
      <H5PContext.Provider value={this}>
        <Main initialScene={startScene} />
      </H5PContext.Provider>,
      wrapper,
    );
  }

  resize = () => {
    if (!this.wrapper) {
      return;
    }

    // TODO: This can be implemented with a container query in css, then the whole resize function should be obsolete
    const mobileThreshold = 815;
    const wrapperSize = this.wrapper.getBoundingClientRect();
    if (wrapperSize.width < mobileThreshold) {
      this.wrapper.classList.add('mobile');
    }
    else {
      this.wrapper.classList.remove('mobile');
    }
  };

  ready(ready) {
    if (this.passReadies) {
      this.parent.ready(ready);
    }
    else {
      this.readies.push(ready);
    }
  }

  validate() {
    return true;
  }
};
