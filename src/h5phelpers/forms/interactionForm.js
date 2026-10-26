import { getInteractionsField, isChildrenValid } from '@h5phelpers/editorForms.js';

/**
 * Create interaction form and append it to wrapper.
 * @param {object} field Semantics field of content.
 * @param {object} params Interaction parameters.
 * @param {HTMLElement} wrapper DOM element to append form to.
 * @param {object} parent Parent widget.
 * @param {object[]} [neighborOptions] Options with value and label for interactions that can be connected.
 */
export const createInteractionForm = (field, params, wrapper, parent, neighborOptions = []) => {
  const hiddenFormFields = ['interactionPosition', 'id'];

  const interactionsField = getInteractionsField(field);
  const interactionFields = interactionsField.field.fields.filter((field) => {
    return !hiddenFormFields.includes(field.name);
  });

  // Neighbors widget renders options of semantics field
  const neighborsField = interactionFields.find((field) => field.name === 'neighbors');
  neighborsField.options = neighborOptions;

  H5PEditor.processSemanticsChunk(interactionFields, params, wrapper, parent);

  const libraryWrapper = wrapper.querySelector('.field.library');

  const hiddenSemanticsSelectors = [
    '.h5p-editor-flex-wrapper',
    '.h5peditor-field-description',
    'select',
    '.h5peditor-copypaste-wrap',
  ];

  // Remove semantics that we don't want to show
  hiddenSemanticsSelectors.forEach((selector) => {
    const foundElement = wrapper.querySelector(`.field.library > ${selector}`);

    if (foundElement) {
      libraryWrapper.removeChild(foundElement);
    }
  });
};

/**
 * Set interaction position parameter.
 * @param {object} params Interaction parameters.
 * @param {object} interactionPosition Interaction position with x and y.
 * @returns {object} Updated interaction parameters.
 */
export const sanitizeInteractionParams = (params, interactionPosition) => {
  if (interactionPosition) {
    params.interactionPosition = interactionPosition;
  }

  return params;
};

/**
 * Check if interaction form is valid and mark invalid fields with error.
 * @param {Array<object>} children Children widgets of interaction form.
 * @returns {boolean} True if all children are valid.
 */
export const validateInteractionForm = (children) => {
  H5PEditor.Html.removeWysiwyg();
  return isChildrenValid(children);
};