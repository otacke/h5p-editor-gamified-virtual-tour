import { getSceneField, isChildrenValid } from '../editorForms.js';

const DEFAULT_INTERACTION_POSITION_X = 50;

const DEFAULT_INTERACTION_POSITION_Y = 50;

const DefaultInteractionValues = {
  threeSixty: {
    spread: 20,
  },
  static: {
    spread: 30,
    center: [DEFAULT_INTERACTION_POSITION_X, DEFAULT_INTERACTION_POSITION_Y],
  },
};

/**
 * Creates scene form and appends it to wrapper
 * @param {object} field The H5P semantics field for the scene.
 * @param {object} params The parameter values of the scene.
 * @param {object} wrapper The DOM element the form is appended to.
 * @param {object} parent The parent editor data object passed to processSemanticsChunk.
 */
export const createSceneForm = (field, params, wrapper, parent) => {
  const sceneField = getSceneField(field);
  const hiddenSceneFields = [
    'sceneId',
    'cameraStartPosition',
    'interactions',
  ];

  const sceneFields = sceneField.field.fields.filter((sceneField) => {
    return !hiddenSceneFields.includes(sceneField.name);
  });

  H5PEditor.processSemanticsChunk(
    sceneFields,
    params,
    wrapper,
    parent,
  );
};

/**
 * Checks if scene form is valid and marks invalid fields
 * @param {object} children The form data of the scene to validate.
 * @returns {boolean} True if valid
 */
export const validateSceneForm = (children) => {
  H5PEditor.Html.removeWysiwyg();
  return isChildrenValid(children);
};

/**
 * Sets default values for scene parameters that are not initially set by
 * the user when creating a scene.
 * @param {object} params The parameter values of the scene.
 * @param {boolean} isThreeSixty Whether the scene is a 360 scene.
 * @param {string} cameraPos The camera position as comma-separated yaw and pitch string (degrees).
 */
export const sanitizeSceneForm = (params, isThreeSixty, cameraPos) => {
  if (!params.cameraStartPosition) {
    params.cameraStartPosition = [
      // eslint-disable-next-line no-magic-numbers
      -(Math.PI * (2 / 3)),
      0,
    ].join(',');
  }

  if (!params.interactions) {
    params.interactions = [];
  }

  params.interactions.forEach((interaction) => {
    sanitizeInteractionPositions(interaction, isThreeSixty, cameraPos);
  });
};

/**
 * Check if all interactions has valid positions
 * @param {object} params The parameter values of the scene.
 * @param {boolean} isThreeSixty Whether the scene is a 360 scene.
 * @returns {boolean} True when all interactions have positions valid for the scene type.
 */
export const isInteractionsValid = (params, isThreeSixty) => {
  if (!params.interactions) {
    return true;
  }

  return params.interactions.every((interaction) => {
    return isInteractionPositionValid(interaction, isThreeSixty);
  });
};

/**
 * Get initial parameters for an empty scene
 * @param {Array} scenes The scenes already in the content.
 * @returns {object} Initial parameters for an empty scene (a unique sceneId).
 */
export const getDefaultSceneParams = (scenes) => {
  return {
    sceneId: getUniqueSceneId(scenes),
  };
};

/**
 * Checks if a single interaction has a valid position given scene type
 * @param {object} interaction The interaction to check.
 * @param {boolean} isThreeSixty Whether the scene is a 360 scene.
 * @returns {boolean} True when the interaction position is valid for the given scene type.
 */
const isInteractionPositionValid = (interaction, isThreeSixty) => {
  const position = interaction.interactionpos.split(',');
  return position.every((pos) => {
    const hasThreeSixtyPos = pos.substr(-1) !== '%';
    return hasThreeSixtyPos === isThreeSixty;
  });
};

/**
 * Sets a default position for an interaction if it has an invalid position for
 * the given scene type
 * @param {object} interaction The interaction whose position may be corrected.
 * @param {boolean} isThreeSixty Whether the scene is a 360 scene.
 * @param {string} cameraPos The camera position as comma-separated yaw and pitch string (degrees).
 */
const sanitizeInteractionPositions = (interaction, isThreeSixty, cameraPos) => {
  if (!isInteractionPositionValid(interaction, isThreeSixty)) {
    interaction.interactionpos = getNewInteractionPos(isThreeSixty, cameraPos);
  }
};

/**
 * Gets a default interaction position given a scene type
 * @param {boolean} isThreeSixtyScene Whether the position is for a 360 scene.
 * @param {string} cameraPos The camera position as comma-separated yaw and pitch string (degrees).
 * @returns {string} The new position as comma-separated values (degrees for 360 scenes, percentages otherwise).
 */
const getNewInteractionPos = (isThreeSixtyScene, cameraPos) => {
  // Place interactions spread randomly within a threshold in degrees
  let center = DefaultInteractionValues.static.center;
  let spread = DefaultInteractionValues.static.spread;

  if (isThreeSixtyScene) {
    center = cameraPos.split(',').map(parseFloat);
    // eslint-disable-next-line no-magic-numbers
    spread = DefaultInteractionValues.threeSixty.spread * Math.PI / 180;
  }

  return center.map((pos) => spreadByValue(pos, spread))
    .map((pos) => isThreeSixtyScene ? pos : `${pos  }%`)
    .join(',');
};

/**
 * Gets a random position within a percentage spread around the center
 * position
 * @param {number} center The center value to spread around.
 * @param {number} spread The spread applied to the center value.
 * @returns {number} A random value within the spread around the center.
 */
const spreadByValue = (center, spread) => {
  // eslint-disable-next-line no-magic-numbers
  return center - (spread / 2) + (Math.random() * spread);
};

/**
 * Grabs a unique ID that is higher than the highest ID in our scenes collection
 * @param {Array} scenes The scenes in the content.
 * @returns {number} A scene ID higher than any existing scene ID.
 */
const getUniqueSceneId = (scenes) => {
  if (!scenes.length) {
    return 0;
  }

  const sceneIds = scenes.map((scene) => scene.sceneId);
  const maxSceneId = Math.max(...sceneIds);
  return maxSceneId + 1;
};
