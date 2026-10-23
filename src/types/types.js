import PropTypes from 'prop-types';
import { SceneTypes } from '@components/Scene/Scene.js';
import { InteractionEditingType } from '@components/EditingDialog/InteractionEditor.js';

/** @constant {object} sceneType PropTypes shape for scene type. */
export const sceneType = PropTypes.shape({
  sceneType: PropTypes.oneOf(Object.values(SceneTypes)).isRequired,
  scenename: PropTypes.string.isRequired,
  scenesrc: PropTypes.shape({
    path: PropTypes.string.isRequired,
    alt: PropTypes.string,
  }).isRequired,
});

/** @constant {object} editingSceneType PropTypes type for scene being edited. */
export const editingSceneType = PropTypes.oneOfType([
  PropTypes.number,
  PropTypes.oneOf(Object.values(InteractionEditingType)),
]);