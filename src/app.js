import React from 'react';
import { createRoot } from 'react-dom/client';
import Main from '@components/Main.js';
import { H5PContext } from '@context/H5PContext.js';
import NeighborsSelector from '@src/widgets/NeighborsSelector.js';
import ShowWhen from '@src/widgets/ShowWhen/ShowWhen.js';
import ScoreRangeList from '@src/widgets/ScoreRangeList/ScoreRangeList.js';

H5PEditor.widgets.gamifiedVirtualTourNeighbors = NeighborsSelector;
H5PEditor.widgets.gamifiedVirtualTourShowWhen = ShowWhen;
// List widgets are looked up directly in H5PEditor
H5PEditor.GamifiedVirtualTourScoreRangeList = ScoreRangeList;

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

    // Interactions created before IDs were introduced need one
    this.params.scenes.forEach((scene) => {
      (scene.interactions ?? []).forEach((interaction) => {
        interaction.id = interaction.id || H5P.createUUID();
      });
    });
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
