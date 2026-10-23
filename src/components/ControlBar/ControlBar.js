import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SceneEditingType } from '@components/EditingDialog/SceneEditor.js';
import '@components/ControlBar/ControlBar.css';
import { H5PContext } from '@context/H5PContext.js';
import { SceneTypes } from '@components/Scene/Scene.js';
import { getSceneFromId } from '@h5phelpers/sceneParams.js';
import SceneList from '@components/ControlBar/SceneSelector/SceneList.js';
import SceneSelectorSubmenu from '@components/ControlBar/SceneSelector/Row/Submenu/SceneSelectorSubmenu.js';
import SceneSelector from '@components/ControlBar/SceneSelector/SceneSelector.js';

/**
 * Render control bar with scene selector and buttons.
 */
export default class ControlBar extends Component {
  /**
   * React - create DOM elements.
   * @returns {React.Element} Rendered control bar element.
   */
  render() {
    const scenes = this.context.params.scenes;
    const scene = getSceneFromId(scenes, this.props.currentScene);
    const is360Scene = scene
      ? scene.sceneType === SceneTypes.THREE_SIXTY_SCENE
      : false;

    return (
      <div className='h5p-control-bar'>
        <SceneSelector
          currentScene={this.props.currentScene}
          isExpanded={this.props.isSceneSelectorExpanded}
          toggleExpand={this.props.toggleExpandSceneSelector}
        >
          <SceneList
            scenes={this.context.params.scenes}
            startScene={this.props.startScene}
            markedScene={this.props.currentScene}
            onSceneClick={this.props.changeScene}
          >
            {(isStartScene, sceneId) => (
              <SceneSelectorSubmenu
                isStartScene={isStartScene}
                setStartScene={() => this.props.setStartScene(sceneId)}
                onJump={() => this.props.changeScene(sceneId)}
                onEdit={() => this.props.editScene(sceneId)}
                onDelete={() => this.props.deleteScene(sceneId)}
                setStartingSceneLabel={this.context.t('setStartingScene')}
                goToSceneLabel={this.context.t('goToScene')}
                editLabel={this.context.t('edit')}
                deleteLabel={this.context.t('delete')}
              />
            )}
          </SceneList>
        </SceneSelector>
        <div className='buttons-wrapper'>
          <button
            className='h5p-new-scene-button'
            onClick={() => this.props.newScene(SceneEditingType.NEW_SCENE)}
          >+ {this.context.t('newScene')}</button>
          {
            is360Scene &&
            <div className={ `button-wrapper${  this.props.isInStartingPosition ? '' : ' not-disabled'}` }>
              <button
                className='set-starting-position-button'
                onClick={ this.props.onSetStartingPosition }
                aria-describedby='set-starting-position-tooltip'
                disabled={ this.props.isInStartingPosition }
              >{this.context.t('setCameraStart')}</button>
              <div className="tooltip" id="set-starting-position-tooltip">
                <div className="text-wrapper">{this.context.t('setCameraStartTooltip')}</div>
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}

ControlBar.contextType = H5PContext;

ControlBar.propTypes = {
  currentScene: PropTypes.number,
  startScene: PropTypes.number,
  isSceneSelectorExpanded: PropTypes.bool.isRequired,
  toggleExpandSceneSelector: PropTypes.func.isRequired,
  newScene: PropTypes.func.isRequired,
  onSetStartingPosition: PropTypes.func.isRequired,
  changeScene: PropTypes.func.isRequired,
  setStartScene: PropTypes.func.isRequired,
  editScene: PropTypes.func.isRequired,
  deleteScene: PropTypes.func.isRequired,
};
