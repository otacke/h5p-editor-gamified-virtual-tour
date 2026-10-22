import { SceneEditingType } from '../components/EditingDialog/SceneEditor.js';
import { isGoToScene } from './libraryParams.js';

/**
 * Get scene from id
 * @param {Array} scenes The scenes in the content.
 * @param {number} sceneId The ID of the scene to find.
 * @returns {object|undefined} The scene with the given ID, or undefined when not found.
 */
export const getSceneFromId = (scenes, sceneId) => {
  return scenes.find((scene) => {
    return scene.sceneId === sceneId;
  });
};

/**
 * Delete a scene in parameters and deletes any GoToScene interactions
 * within other scenes that was pointing to the deleted scene
 * @param {Array} scenes The scenes in the content.
 * @param {number} sceneId The ID of the scene to delete.
 * @returns {Array} The scenes with the deleted scene and its GoToScene interactions removed.
 */
export const deleteScene = (scenes, sceneId) => {
  // Filter out the scene
  const sceneRemoved  = scenes.filter((scene) => {
    return scene.sceneId !== sceneId;
  });

  // Filter out any interactions pointing to the scene
  return sceneRemoved.map((scene) => {
    const interactions = scene.interactions;
    if (interactions) {
      scene.interactions = interactions.filter((interaction) => {
        if (!isGoToScene(interaction)) {
          return true;
        }

        // Filter away GoToScene with the deleted scene id
        return interaction.action.params.nextSceneId !== sceneId;
      });
    }

    return scene;
  });
};

/**
 * Updates a scene within parameters
 * @param {Array} scenes The scenes in the content.
 * @param {object} params The new scene parameters.
 * @param {number} editingScene The ID of the scene to update, or SceneEditingType.NEW_SCENE when adding a new scene.
 * @returns {Array} The updated scenes.
 */
export const updateScene = (scenes, params, editingScene = -1) => {
  if (editingScene === SceneEditingType.NEW_SCENE) {
    scenes.push(params);
    return scenes;
  }

  return scenes.map((scene) => {
    if (scene.sceneId === editingScene) {
      // Replace scene
      scene = params;
    }
    return scene;
  });
};

/**
 * Set scene position in parameters
 * @param {Array} scenes The scenes in the content.
 * @param {number} sceneId The ID of the scene to update.
 * @param {object} camera The camera position with yaw and pitch values.
 */
export const setScenePositionFromCamera = (scenes, sceneId, camera) => {
  const scene = getSceneFromId(scenes, sceneId);
  scene.cameraStartPosition = [
    camera.yaw,
    camera.pitch,
  ].join(',');
};

