import { getSceneFromId } from './sceneParams.js';

export const Libraries = {
  GoToScene: {
    machineName: 'H5P.GoToScene',
  },
};

/**
 * Get default params for a library
 * @param {string} uberName The uber name of the library (e.g. H5P.GoToScene).
 * @returns {object} Default params for the library (empty interactionpos, action with the library name).
 */
export const getDefaultLibraryParams = (uberName) => {
  return {
    interactionpos: '', // Filled in on saving interaction
    action: {
      library: uberName,
      params: {},
    },
  };
};

/**
 * Updates position of interaction in parameters
 * @param {Array} scenes The scenes in the content.
 * @param {number} sceneId The ID of the scene containing the interaction.
 * @param {number} interactionIndex The index of the interaction within the scene.
 * @param {object} pos The new position with yaw and pitch values.
 */
export const updatePosition = (scenes, sceneId, interactionIndex, pos) => {
  const scene = getSceneFromId(scenes, sceneId);
  const interaction = scene.interactions[interactionIndex];

  // Update interaction pos
  interaction.interactionpos = [
    pos.yaw,
    pos.pitch,
  ].join(',');
};

/**
 * Checks if an interaction is a GoToScene library
 * @param {object} interaction The interaction to check.
 * @returns {boolean} True when the interaction is a GoToScene interaction.
 */
export const isGoToScene = (interaction) => {
  const library = H5P.libraryFromString(interaction.action.library);
  return library.machineName === Libraries.GoToScene.machineName;
};
