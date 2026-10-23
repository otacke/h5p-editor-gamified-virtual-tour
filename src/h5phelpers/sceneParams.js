import { SceneEditingType } from '@components/EditingDialog/SceneEditor.js';
import { isGoToScene } from '@h5phelpers/libraryParams.js';

/**
 * Get scene from ID.
 * @param {Array} scenes Scenes in content.
 * @param {number} sceneId ID of scene to find.
 * @returns {object|undefined} Scene with given ID, or undefined when not found.
 */
export const getSceneFromId = (scenes, sceneId) => {
  return scenes.find((scene) => {
    return scene.sceneId === sceneId;
  });
};

/**
 * Delete scene in parameters and delete any GoToScene interactions within other scenes pointing to deleted scene.
 * @param {Array} scenes Scenes in content.
 * @param {number} sceneId ID of scene to delete.
 * @returns {Array} Scenes with deleted scene and its GoToScene interactions removed.
 */
export const deleteScene = (scenes, sceneId) => {
  // Filter out the scene
  const sceneRemoved  = scenes.filter((scene) => {
    return scene.sceneId !== sceneId;
  });

  // Filter out any interactions pointing to scene.
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
 * Update scene within parameters.
 * @param {Array} scenes Scenes in content.
 * @param {object} params New scene parameters.
 * @param {number} editingScene ID of scene to update, or SceneEditingType.NEW_SCENE when adding new scene.
 * @returns {Array} Updated scenes.
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
 * Set scene position in parameters.
 * @param {Array} scenes Scenes in content.
 * @param {number} sceneId ID of scene to update.
 * @param {object} camera Camera position with yaw and pitch values.
 */
export const setScenePositionFromCamera = (scenes, sceneId, camera) => {
  const scene = getSceneFromId(scenes, sceneId);
  scene.cameraStartPosition = {
    yaw: `${camera.yaw}`,
    pitch: `${camera.pitch}`,
  };
};

