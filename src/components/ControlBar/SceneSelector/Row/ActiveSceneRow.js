import React from 'react';
import { sceneType } from '@types/types.js';
import '@components/ControlBar/SceneSelector/Row/ActiveSceneRow.css';
import { SceneTypes } from '@components/Scene/Scene.js';
import PropTypes from 'prop-types';


/**
 * Render active scene row.
 * @param {object} props Component props.
 * @returns {React.Element} Rendered active scene row element.
 */
const ActiveSceneRow = (props) => {
  if (!props.scene) {
    return (
      <div>{props.noScenesTitle}</div>
    );
  }
  const rowClasses = ['active-scene'];
  if (props.scene.sceneType === SceneTypes.THREE_SIXTY_SCENE) {
    rowClasses.push('three-sixty');
  }

  return (
    <div className={rowClasses.join(' ')}>
      <div className='h5p-scene-denotation'>{props.currentSceneLabel}:</div>
      <div className='h5p-scene-name' dangerouslySetInnerHTML={ { __html: props.scene.scenename } }></div>
    </div>
  );
};

ActiveSceneRow.propTypes = {
  scene: sceneType,
  noScenesTitle: PropTypes.string.isRequired,
  currentSceneLabel: PropTypes.string.isRequired,
};

export default ActiveSceneRow;