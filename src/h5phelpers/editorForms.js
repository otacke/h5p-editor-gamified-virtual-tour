import { getLibraries } from '@context/H5PContext.js';

/**
 * Get scenes field from Gamified Virtual Tour semantics structure.
 * @param {object} field Semantics field of content.
 * @returns {object} Scenes semantics field.
 */
export const getSceneField = (field) => {
  return H5PEditor.findSemanticsField('scenes', field);
};

/**
 * Get interactions field within scene from semantics structure.
 * @param {object} field Semantics field of content.
 * @returns {object} Interactions semantics field of scene.
 */
export const getInteractionsField = (field) => {
  const sceneFields = getSceneField(field);

  return H5PEditor.findSemanticsField('interactions', sceneFields);
};

/**
 * Get library data for single library.
 * @param {object} field Semantics field of content.
 * @param {string} library Machine name of library to find.
 * @returns {Promise<object>} Promise resolving with library data.
 */
export const getLibraryDataFromFields = async (field, library) => {
  const libraries = await getLibraries(field);
  return libraries.find((lib) => {
    return lib.uberName === library;
  });
};

/**
 * Check if children are valid and set error messages for invalid fields.
 * @param {Array<object>} children Children widgets to validate.
 * @returns {boolean} True if all children are valid.
 */
export const isChildrenValid = (children) => {
  let isInputsValid = true;

  // validate() should always run for all children because it adds
  // styling to children that fails to validate
  children.forEach((child) => {

    // Special validation for scene image, since having a required image
    // is not supported by core yet
    const isRequiredImage = child.field.type === 'image'
      && (child.field.optional === undefined || child.field.optional === false);
    if (isRequiredImage) {
      if (!child.params || !child.params.path) {
        isInputsValid = false;
      }
    }

    // Note that validate() does not necessarily return a bool...
    // e.g. for texts it returns the string
    const isChildValid = child.validate();
    if (isChildValid === false) {
      isInputsValid = false;
    }
  });

  return isInputsValid;
};

/**
 * Add change listeners to behavior widgets.
 * @param {object} parent Parent field with behavior widgets.
 * @param {function} callback Callback to run on behavior change.
 */
const addBehavioralChangeListeners = (parent, callback) => {
  const behaviour = parent.children.find((child) => {
    return child.field.name === 'behaviour';
  });

  const sceneRendering = behaviour.children.find((child) => {
    return child.field.name === 'sceneRenderingQuality';
  });

  const label = behaviour.children.find((child) => {
    return child.field.name === 'label';
  });

  for (let i = 0 ; i < label.children.length ; i++) {
    label.children[i].changes.push(callback);
  }

  sceneRendering.changes.push(callback);

  const paths = behaviour.children.find((child) => {
    return child.field.name === 'paths';
  });

  paths.children.forEach((child) => {
    child.changes.push(callback);
  });
};

/**
 * Add change listeners to behavior widgets, waiting for ready when children not loaded.
 * @param {object} parent Parent field with behavior widgets.
 * @param {function} callback Callback to run on behavior change.
 */
export const addBehavioralListeners = (parent, callback) => {
  if (parent.children.length === 0) {
    parent.ready(() => {
      addBehavioralChangeListeners(parent, callback);
    });
    return;
  }
  addBehavioralChangeListeners(parent, callback);
};
