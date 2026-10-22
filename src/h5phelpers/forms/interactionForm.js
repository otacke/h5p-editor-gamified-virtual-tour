import { getInteractionsField, isChildrenValid } from '../editorForms.js';

/**
 * Create interaction form and append it to wrapper
 * @param {object} field The semantics field of the content
 * @param {object} params The interaction parameters
 * @param {HTMLElement} wrapper The DOM element to append the form to
 * @param {object} parent The parent widget
 */
export const createInteractionForm = (field, params, wrapper, parent) => {
  const hiddenFormFields = [
    'interactionpos',
  ];

  const interactionsField = getInteractionsField(field);
  const interactionFields = interactionsField.field.fields.filter((field) => {
    return !hiddenFormFields.includes(field.name);
  });

  H5PEditor.processSemanticsChunk(
    interactionFields,
    params,
    wrapper,
    parent,
  );

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
 * Set interaction position parameter
 * @param {object} params The interaction parameters
 * @param {string} interactionPosition The interaction position as a comma separated string
 * @returns {object} The updated interaction parameters
 */
export const sanitizeInteractionParams = (params, interactionPosition) => {
  if (interactionPosition) {
    params.interactionpos = interactionPosition;
  }

  return params;
};

/**
 * Checks if interaction form is valid and marks invalid fields with an error
 * @param {Array<object>} children The children widgets of the interaction form
 * @returns {boolean} True if all children are valid
 */
export const validateInteractionForm = (children) => {
  H5PEditor.Html.removeWysiwyg();
  return isChildrenValid(children);
};