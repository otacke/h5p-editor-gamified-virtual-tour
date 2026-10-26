import { getSceneField, isChildrenValid } from '@h5phelpers/editorForms.js';

/** @constant {number} DEFAULT_INTERACTION_POSITION_X Default interaction position on X axis. */
const DEFAULT_INTERACTION_POSITION_X = 50;

/** @constant {number} DEFAULT_INTERACTION_POSITION_Y Default interaction position on Y axis. */
const DEFAULT_INTERACTION_POSITION_Y = 50;

/** @constant {object} DefaultInteractionValues Default values for new interaction positions. */
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
 * Check if overview map is active and has an image.
 * @param {object[]} formChildren Children widgets of editor form.
 * @returns {boolean} True if scenes can be positioned on overview map.
 */
const hasOverviewMap = (formChildren) => {
  const behaviour = formChildren.find((child) => child.field?.name === 'behaviour');
  const overviewMap = behaviour?.params?.overviewMap;

  return overviewMap?.show === true && !!overviewMap.image?.path;
};

/**
 * Create scene form and append it to wrapper.
 * @param {object} field H5P semantics field for scene.
 * @param {object} params Parameter values of scene.
 * @param {object} wrapper DOM element to append form to.
 * @param {object} parent Parent editor data object passed to processSemanticsChunk.
 */
export const createSceneForm = (field, params, wrapper, parent) => {
  // Will be reset by processSemanticsChunk, but required for finding overview map image
  const formChildren = parent.children;

  const sceneField = getSceneField(field);
  const hiddenSceneFields = ['sceneId', 'cameraStartPosition', 'interactions', 'paths', 'overviewMapPosition'];

  const sceneFields = sceneField.field.fields.filter((sceneField) => {
    return !hiddenSceneFields.includes(sceneField.name);
  });

  H5PEditor.processSemanticsChunk(sceneFields, params, wrapper, parent);

  if (!hasOverviewMap(formChildren)) {
    return;
  }

  /*
   * The coordinate selector looks up the overview map image while being created, but processSemanticsChunk
   * empties the children of the form meanwhile. Using a separate parent next to the form children
   * lets the image field path `../behaviour/overviewMap/image` resolve.
   */
  const positionParent = {
    parent: { children: formChildren },
    passReadies: false,
    children: [],
    ready(callback) {
      this.readies.push(callback);
    },
  };

  const positionField = sceneField.field.fields.find((sceneField) => sceneField.name === 'overviewMapPosition');
  H5PEditor.processSemanticsChunk([positionField], params, wrapper, positionParent);
  parent.children.push(...positionParent.children);
};

/**
 * Check if scene form is valid and mark invalid fields.
 * @param {object} children Form data of scene to validate.
 * @returns {boolean} True if valid.
 */
export const validateSceneForm = (children) => {
  H5PEditor.Html.removeWysiwyg();
  return isChildrenValid(children);
};

/**
 * Set default values for scene parameters not initially set by user.
 * @param {object} params Parameter values of scene.
 * @param {boolean} isThreeSixty Whether scene is a 360 scene.
 * @param {object} cameraPos Camera position with yaw and pitch.
 */
export const sanitizeSceneForm = (params, isThreeSixty, cameraPos) => {
  if (!params.cameraStartPosition) {
    params.cameraStartPosition = {
      // eslint-disable-next-line no-magic-numbers
      yaw: `${-(Math.PI * (2 / 3))}`,
      pitch: '0',
    };
  }

  if (!params.interactions) {
    params.interactions = [];
  }

  params.interactions.forEach((interaction) => {
    sanitizeInteractionPositions(interaction, isThreeSixty, cameraPos);
  });
};

/**
 * Check if all interactions have valid positions.
 * @param {object} params Parameter values of scene.
 * @param {boolean} isThreeSixty Whether scene is a 360 scene.
 * @returns {boolean} True when all interactions have positions valid for scene type.
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
 * Get initial parameters for empty scene.
 * @param {Array} scenes Scenes already in content.
 * @returns {object} Initial parameters for empty scene (unique sceneId).
 */
export const getDefaultSceneParams = (scenes) => {
  return {
    sceneId: getUniqueSceneId(scenes),
  };
};

/**
 * Check if interaction has valid position for scene type.
 * @param {object} interaction Interaction to check.
 * @param {boolean} isThreeSixty Whether scene is a 360 scene.
 * @returns {boolean} True when interaction position is valid for scene type.
 */
const isInteractionPositionValid = (interaction, isThreeSixty) => {
  const position = [interaction.interactionPosition.x, interaction.interactionPosition.y];
  return position.every((pos) => {
    const hasThreeSixtyPos = pos.substr(-1) !== '%';
    return hasThreeSixtyPos === isThreeSixty;
  });
};

/**
 * Set default position for interaction if it has invalid position for given scene type.
 * @param {object} interaction Interaction whose position may be corrected.
 * @param {boolean} isThreeSixty Whether scene is a 360 scene.
 * @param {object} cameraPos Camera position with yaw and pitch.
 */
const sanitizeInteractionPositions = (interaction, isThreeSixty, cameraPos) => {
  if (!isInteractionPositionValid(interaction, isThreeSixty)) {
    interaction.interactionPosition = getNewInteractionPos(isThreeSixty, cameraPos);
  }
};

/**
 * Get default interaction position given scene type.
 * @param {boolean} isThreeSixtyScene Whether position is for a 360 scene.
 * @param {object} cameraPos Camera position with yaw and pitch.
 * @returns {object} New position with x and y (yaw and pitch for 360 scenes, percentages otherwise).
 */
const getNewInteractionPos = (isThreeSixtyScene, cameraPos) => {
  // Place interactions spread randomly within a threshold in degrees
  let center = DefaultInteractionValues.static.center;
  let spread = DefaultInteractionValues.static.spread;

  if (isThreeSixtyScene) {
    center = [cameraPos.yaw, cameraPos.pitch].map(parseFloat);
    // eslint-disable-next-line no-magic-numbers
    spread = DefaultInteractionValues.threeSixty.spread * Math.PI / 180;
  }

  const [x, y] = center.map((pos) => spreadByValue(pos, spread))
    .map((pos) => isThreeSixtyScene ? `${pos}` : `${pos}%`);

  return { x, y };
};

/**
 * Get random position within percentage spread around center position.
 * @param {number} center Center value to spread around.
 * @param {number} spread Spread applied to center value.
 * @returns {number} Random value within spread around center.
 */
const spreadByValue = (center, spread) => {
  // eslint-disable-next-line no-magic-numbers
  return center - (spread / 2) + (Math.random() * spread);
};

/**
 * Grab unique ID higher than highest ID in scenes collection.
 * @param {Array} scenes Scenes in content.
 * @returns {number} Scene ID higher than any existing scene ID.
 */
const getUniqueSceneId = (scenes) => {
  if (!scenes.length) {
    return 0;
  }

  const sceneIds = scenes.map((scene) => scene.sceneId);
  const maxSceneId = Math.max(...sceneIds);
  return maxSceneId + 1;
};
