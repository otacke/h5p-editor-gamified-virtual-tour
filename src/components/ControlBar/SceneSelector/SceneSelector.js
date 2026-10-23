import React from 'react';
import PropTypes from 'prop-types';
import { H5PContext } from '../../../context/H5PContext.js';
import './SceneSelector.css';
import ActiveSceneRow from './Row/ActiveSceneRow.js';
import ExpandedSceneSelector from './ExpandedSceneSelector.js';

/**
 * Render scene selector with active scene and expanded scene list.
 */
export default class SceneSelector extends React.Component {
  /**
   * Create scene selector component.
   * @param {object} props Component props.
   */
  constructor(props) {
    super(props);

    this.state = {
      isExpanded: false,
    };
  }

  /**
   * React - create DOM elements.
   * @returns {React.Element} Rendered scene selector element.
   */
  render() {
    const scenes = this.context.params.scenes;
    const activeScene = scenes.find((scene) => {
      return scene.sceneId === this.props.currentScene;
    });

    const sceneSelectorClasses = ['h5p-scene-selector'];
    if (!activeScene) {
      sceneSelectorClasses.push('disabled');
    }

    return (
      <div className='scene-selector-wrapper'>
        <div
          id='scene-selector'
          className={sceneSelectorClasses.join(' ')}
          onClick={() => this.props.toggleExpand(undefined)}
        >
          <div className='h5p-select-content'>
            <ActiveSceneRow
              noScenesTitle={this.context.t('noScenesTitle')}
              currentSceneLabel={this.context.t('currentScene')}
              scene={activeScene}
              simpleView={true}
            />
          </div>
          <div className='h5p-select-handle'/>

        </div>
        {
          this.props.isExpanded &&
          <ExpandedSceneSelector chooseSceneLabel={this.context.t('chooseScene')}>
            {this.props.children}
          </ExpandedSceneSelector>
        }
      </div>
    );
  }
}

SceneSelector.contextType = H5PContext;

SceneSelector.propTypes = {
  currentScene: PropTypes.number,
  isExpanded: PropTypes.bool,
  toggleExpand: PropTypes.func.isRequired,
  children: PropTypes.node,
};
