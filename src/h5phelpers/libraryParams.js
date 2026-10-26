import { getSceneFromId } from '@h5phelpers/sceneParams.js';

/** @constant {object} Libraries Library machine names. */
export const Libraries = {
  GoToScene: {
    machineName: 'H5P.GoToScene',
  },
};

/**
 * Get default parameters for library.
 * @param {string} uberName Uber name of library (e.g. H5P.GoToScene).
 * @returns {object} Default parameters for library (unique ID, empty interactionPosition, action with library name).
 */
export const getDefaultLibraryParams = (uberName) => {
  return {
    id: H5P.createUUID(),
    interactionPosition: { x: '', y: '' }, // Filled in on saving interaction
    action: {
      library: uberName,
      params: {},
    },
  };
};

/**
 * Update position of interaction in parameters.
 * @param {Array} scenes Scenes in content.
 * @param {number} sceneId ID of scene containing interaction.
 * @param {number} interactionIndex Index of interaction within scene.
 * @param {object} pos New position with yaw and pitch values.
 */
export const updatePosition = (scenes, sceneId, interactionIndex, pos) => {
  const scene = getSceneFromId(scenes, sceneId);
  const interaction = scene.interactions[interactionIndex];

  // Update interaction pos
  interaction.interactionPosition = {
    x: `${pos.yaw}`,
    y: `${pos.pitch}`,
  };
};

/**
 * Check if interaction is a GoToScene library.
 * @param {object} interaction Interaction to check.
 * @returns {boolean} True when interaction is a GoToScene interaction.
 */
export const isGoToScene = (interaction) => {
  const library = H5P.libraryFromString(interaction.action.library);
  return library.machineName === Libraries.GoToScene.machineName;
};
