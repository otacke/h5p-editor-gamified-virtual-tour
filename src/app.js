import React from 'react';
import { createRoot } from 'react-dom/client';
import Main from '@components/Main.js';
import { H5PContext } from '@context/H5PContext.js';

/**
 * H5P content editor for gamified virtual tour.
 */
H5PEditor.widgets.gamifiedVirtualTour = H5PEditor.GamifiedVirtualTour = class GamifiedVirtualTour {
  /**
   * Create instance of GamifiedVirtualTour.
   * @param {object} parent Parent widget.
   * @param {object} field Semantics field of content.
   * @param {object} params Initial parameters of content.
   * @param {function} setValue Function to update content parameters.
   */
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
   * @returns {string} Translated string.
   */
  t() {
    const args = ['H5PEditor.GamifiedVirtualTour'];
    for (let i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    return H5PEditor.t.apply(window, args);
  }

  /**
   * Append editor to container.
   * @param {object} $container jQuery object of container.
   */
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

    createRoot(wrapper).render(
      <H5PContext.Provider value={this}>
        <Main initialScene={startScene} />
      </H5PContext.Provider>,
    );
  }

  /**
   * Update mobile class on wrapper based on wrapper size.
   */
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

  /**
   * Notify that editor is ready.
   * @param {function} ready Callback to run when editor is ready.
   */
  ready(ready) {
    if (this.passReadies) {
      this.parent.ready(ready);
    }
    else {
      this.readies.push(ready);
    }
  }

  /**
   * Validate content parameters.
   * @returns {boolean} True, as parameters are always valid.
   */
  validate() {
    return true;
  }
};
