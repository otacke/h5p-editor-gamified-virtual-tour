import { getSceneField, isChildrenValid } from '@h5phelpers/editorForms.js';

/**
 * Create form for visual settings of path and append it to wrapper.
 * @param {object} field Semantics field of content.
 * @param {object} params Path parameters.
 * @param {HTMLElement} wrapper DOM element to append form to.
 * @param {object} parent Parent widget.
 */
export const createPathForm = (field, params, wrapper, parent) => {
  const hiddenPathFields = ['from', 'to'];

  const pathsField = getSceneField(field).field.fields.find((sceneField) => sceneField.name === 'paths');
  const pathFields = pathsField.field.fields.filter((pathField) => {
    return !hiddenPathFields.includes(pathField.name);
  });

  H5PEditor.processSemanticsChunk(pathFields, params, wrapper, parent);
};

/**
 * Check if path form is valid and mark invalid fields.
 * @param {object[]} children Children widgets of path form.
 * @returns {boolean} True if all children are valid.
 */
export const validatePathForm = (children) => {
  return isChildrenValid(children);
};
