import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { H5PContext } from '../../../../context/H5PContext.js';
import './GoToScene.css';
import GoToSceneSelector from './GoToSceneSelector.js';

/**
 * Render go-to-scene selector with new scene button.
 */
export default class GoToScene extends Component {
  /**
   * React - create DOM elements.
   * @returns {React.Element} Rendered go-to-scene element.
   */
  render() {
    // Filter out current scene
    const scenes = this.context.params.scenes.filter((scene) => {
      return scene.sceneId !== this.props.currentScene;
    });

    const sceneClasses = ['go-to-scene'];
    if (this.props.hasInputError) {
      sceneClasses.push('has-error');
    }

    return (
      <div className={sceneClasses.join(' ')} >
        {
          scenes.length > 0 &&
          <div className='go-to-scene-selector-wrapper'>
            <GoToSceneSelector
              scenes={scenes}
              markedScene={this.props.markedScene}
              setNextSceneId={this.props.setNextSceneId}
              selectASceneErrorLabel={this.context.t('selectASceneError')}
              pickAnExistingSceneLabel={this.context.t('pickAnExistingScene')}
            />
            <div className='selector-separator'>{this.context.t('or')}</div>
          </div>
        }
        <div className='create-new-scene-wrapper'>
          <div className='new-scene-title'>{this.context.t('createASceneToGoTo')}:</div>
          {
            this.props.hasInputError && !scenes.length &&
            <div className='error-message'>{this.context.t('createSceneError')}</div>
          }
          <button
            className='h5p-new-scene-button'
            onClick={this.props.newScene}
          >+ {this.context.t('newScene')}</button>
        </div>
      </div>
    );
  }
}

GoToScene.contextType = H5PContext;

GoToScene.propTypes = {
  currentScene: PropTypes.number.isRequired,
  markedScene: PropTypes.number,
  hasInputError: PropTypes.bool,
  setNextSceneId: PropTypes.func.isRequired,
  newScene: PropTypes.func.isRequired,
};