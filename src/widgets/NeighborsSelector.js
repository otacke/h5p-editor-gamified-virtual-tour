import '@src/widgets/NeighborsSelector.css';

/**
 * Checkbox list for selecting interactions that are connected to current interaction.
 * Options are set on the semantics field before the form is created.
 */
export default class NeighborsSelector {
  /**
   * Create neighbors selector widget.
   * @param {object} parent Parent widget.
   * @param {object} field Semantics field.
   * @param {string[]} params IDs of connected interactions.
   * @param {function} setValue Callback to set parameters.
   */
  constructor(parent, field, params, setValue) {
    this.field = field;
    this.params = Array.isArray(params) ? params : [];
    this.setValue = setValue;

    // jQuery variables are expected by H5P editor
    this.$item = H5P.jQuery(H5PEditor.createFieldMarkup(this.field, '<div class="h5p-editor-neighbors"></div>'));
    this.$errors = this.$item.children('.h5p-errors');
    this.$item.find('.h5p-editor-neighbors').append(this.buildList());

    this.setValue(this.field, this.params);
  }

  /**
   * Build list of checkboxes, or message if there are no other interactions.
   * @returns {HTMLElement} List or message element.
   */
  buildList() {
    const options = this.field.options ?? [];
    if (!options.length) {
      const message = document.createElement('div');
      message.classList.add('h5peditor-field-description');
      message.textContent = H5PEditor.t('H5PEditor.GamifiedVirtualTour', 'noNeighbors');
      return message;
    }

    const list = document.createElement('ul');
    list.classList.add('h5p-editor-neighbors-list');

    options.forEach((option) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'checkbox');
      input.value = option.value;
      input.checked = this.params.includes(option.value);
      input.addEventListener('change', () => {
        this.handleChange(input);
      });

      const labelText = document.createElement('span');
      labelText.textContent = option.label;

      const label = document.createElement('label');
      label.classList.add('h5p-editor-label');
      label.append(input, labelText);

      const listItem = document.createElement('li');
      listItem.append(label);
      list.append(listItem);
    });

    return list;
  }

  /**
   * Update parameters after checkbox was toggled.
   * @param {HTMLInputElement} input Toggled checkbox.
   */
  handleChange(input) {
    this.params = this.params.filter((id) => id !== input.value);
    if (input.checked) {
      this.params.push(input.value);
    }

    this.setValue(this.field, this.params);
  }

  /**
   * Append widget to form.
   * @param {H5P.jQuery|HTMLElement} $wrapper Wrapper to append to.
   */
  appendTo($wrapper) {
    this.$item.appendTo($wrapper);
  }

  /**
   * Validate widget.
   * @returns {boolean} True, as any selection is valid.
   */
  validate() {
    return true;
  }

  /**
   * Remove widget from form.
   */
  remove() {
    this.$item.remove();
  }
}
