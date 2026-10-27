import '@src/widgets/ScoreRangeList/ScoreRangeList.css';

/** @constant {string[]} RANGE_FIELD_NAMES Names of fields that define the score range. */
const RANGE_FIELD_NAMES = ['from', 'to'];

/**
 * Translate string of editor.
 * @param {string} key Key of string.
 * @returns {string} Translated string.
 */
const t = (key) => H5PEditor.t('H5PEditor.GamifiedVirtualTour', key);

/**
 * Set value of input and trigger change event.
 * @param {HTMLInputElement} input Input element.
 * @param {string|number} value Value to set.
 */
const setValue = (input, value) => {
  input.value = value;
  input.dispatchEvent(new Event('change'));
};

/**
 * Toggle whether button created by H5PEditor.createButton is enabled.
 * @param {HTMLElement} button Button element.
 * @param {boolean} state If true, enable button, else disable it.
 */
const toggleButton = (button, state) => {
  button.setAttribute('aria-disabled', state ? 'false' : 'true');
  if (state) {
    button.setAttribute('tabindex', '0');
  }
  else {
    button.removeAttribute('tabindex');
  }
};

/**
 * List widget for feedback of score ranges, combining H5PEditor.TableList and H5PEditor.RangeList,
 * but with a card per range, so feedback can consist of several fields like HTML text and image.
 */
export default class ScoreRangeList extends H5P.EventDispatcher {
  /**
   * Create score range list widget.
   * @param {H5PEditor.List} list List to render.
   */
  constructor(list) {
    super();

    this.list = list;
    this.rows = [];
    this.isInitialized = false;

    const fields = list.getField().fields;
    this.fromField = fields.find((field) => field.name === 'from');
    this.min = this.fromField.min ?? 0;
    this.max = fields.find((field) => field.name === 'to').max ?? 100;

    const entity = list.getEntity();
    this.entity = entity.charAt(0).toLocaleUpperCase() + entity.slice(1);

    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-editor-gamified-virtual-tour-score-range-list');

    this.messageArea = document.createElement('div');
    this.messageArea.classList.add('message-area');

    this.rowsContainer = document.createElement('ol');
    this.rowsContainer.classList.add('ranges');
    this.dom.append(this.rowsContainer);

    const footer = document.createElement('div');
    footer.classList.add('footer');
    footer.append(this.messageArea);
    this.dom.append(footer);

    H5PEditor.createButton(
      list.getImportance(),
      H5PEditor.t('core', 'addEntity', { ':entity': this.entity }),
      () => list.addItem(),
      true,
    ).appendTo(H5P.jQuery(footer));

    this.distributeButton = this.createDistributeButton();
    footer.append(this.distributeButton);

    list.once('changeWidget', () => {
      this.isInitialized = true;
      this.validateSequence();
    });
  }

  /**
   * Add item of list as range card.
   * @param {H5PEditor.Group} item List item.
   */
  addItem(item) {
    if (!(item instanceof H5PEditor.Group)) {
      return; // Only support multiple fields
    }

    // Set default params in case item has no params
    if (item.params === undefined) {
      item.params = {};
      item.setValue(item.field, item.params);
    }

    item.children = [];

    const element = document.createElement('li');
    element.classList.add('range');

    const head = document.createElement('div');
    head.classList.add('range-head');
    element.append(head);

    const label = document.createElement('div');
    label.classList.add('range-label', 'h5peditor-required');
    label.textContent = this.fromField.label;
    head.append(label);

    const body = document.createElement('div');
    body.classList.add('range-body');
    element.append(body);

    const instances = {};
    item.getFields().forEach((field) => {
      const isRangeField = RANGE_FIELD_NAMES.includes(field.name);

      // Copy, because min value of range fields is changed per row
      const instance = this.processSemanticsField(item, isRangeField ? { ...field, label: 0 } : field);
      if (!instance) {
        return;
      }

      if (field.name === 'to') {
        const dash = document.createElement('div');
        dash.classList.add('range-dash');
        dash.textContent = '–';
        head.append(dash);
      }

      const cell = document.createElement('div');
      cell.classList.add(isRangeField ? 'range-limit' : 'range-feedback');
      (isRangeField ? head : body).append(cell);

      instance.appendTo(H5P.jQuery(cell));
      item.children.push(instance);
      instances[field.name] = instance;
    });

    const row = {
      element: element,
      to: instances.to,
      fromInput: instances.from.$input[0],
      toInput: instances.to.$input[0],
    };

    row.removeButton = this.createRemoveButton(row);
    head.append(row.removeButton);

    this.rowsContainer.append(element);
    this.rows.push(row);

    this.initializeRow(row);
  }

  /**
   * Apply range logic to new row, taken from H5PEditor.RangeList.
   * @param {object} row Row.
   */
  initializeRow(row) {
    const index = this.rows.indexOf(row);
    const previousRow = this.rows[index - 1];

    // 'From' is updated programmatically
    if (previousRow && this.isInitialized) {
      setValue(row.fromInput, '');
    }
    row.fromText = this.addInputText(row.fromInput);
    const fromErrors = row.fromInput.closest('.field')?.querySelector('.h5p-errors');
    if (fromErrors) {
      fromErrors.style.display = 'none';
    }

    // 'To' of last row is always the maximum and thus shown as text
    row.toText = this.addInputText(row.toInput);

    this.linkMinValue(row);

    row.toInput.addEventListener('change', () => {
      this.updateNextFrom(row);
    });

    if (!previousRow) {
      this.toggleButtons(false, row);
    }
    else {
      this.makeEditable(previousRow);
      this.toggleButtons(true, previousRow);
    }

    if (this.isInitialized) {
      this.validateSequence();
    }
  }

  /**
   * Convert semantics into widget.
   * @param {H5PEditor.Group} parent Parent group.
   * @param {object} field Semantics field.
   * @returns {object|undefined} Field instance.
   */
  processSemanticsField(parent, field) {
    if (field.name === undefined || field.type === undefined) {
      return;
    }

    if (parent.params[field.name] === undefined && field.default !== undefined) {
      parent.params[field.name] = field.default;
    }

    const widget = H5PEditor.getWidgetName(field);

    return new H5PEditor.widgets[widget](parent, field, parent.params[field.name], (field, value) => {
      if (value === undefined) {
        delete parent.params[field.name];
      }
      else {
        parent.params[field.name] = value;
      }
    });
  }

  /**
   * Add text showing value of input and hide input.
   * @param {HTMLInputElement} input Input element.
   * @returns {HTMLElement} Text element.
   */
  addInputText(input) {
    const text = document.createElement('div');
    text.classList.add('h5peditor-input-text');
    text.textContent = input.value;
    input.parentElement.insertBefore(text, input);

    input.style.display = 'none';

    input.addEventListener('change', () => {
      text.textContent = input.value;
    });

    return text;
  }

  /**
   * Make 'to' input of row editable, because row is not the last one anymore.
   * @param {object} row Row.
   */
  makeEditable(row) {
    row.toText.style.display = 'none';
    row.toInput.style.display = '';

    if (this.isInitialized) {
      // User action, use no value as default
      setValue(row.toInput, '');

      // Clear 'field is mandatory' error messages
      const errors = row.toInput.closest('.field')?.querySelector('.h5p-errors');
      if (errors) {
        errors.innerHTML = '';
      }
      row.toInput.classList.remove('error');
    }
  }

  /**
   * Keep minimum value of row's 'to' field equal to its 'from' value.
   * @param {object} row Row.
   */
  linkMinValue(row) {
    row.to.field.min = parseInt(row.fromInput.value);

    row.fromInput.addEventListener('change', () => {
      row.to.field.min = parseInt(row.fromInput.value);
      row.toInput.dispatchEvent(new Event('change'));
    });
  }

  /**
   * Update 'from' value of next row when 'to' value of row changed.
   * @param {object} row Row.
   */
  updateNextFrom(row) {
    const nextRow = this.rows[this.rows.indexOf(row) + 1];
    if (!nextRow) {
      return;
    }

    if (row.toInput.value === '') {
      setValue(nextRow.fromInput, '');
      return;
    }

    const value = parseInt(row.toInput.value);
    if (!isNaN(value)) {
      setValue(nextRow.fromInput, Math.min(value + 1, this.max));
    }

    this.validateSequence();
  }

  /**
   * Create button to remove row, confirmed via dialog.
   * @param {object} row Row.
   * @returns {HTMLElement} Button.
   */
  createRemoveButton(row) {
    const confirmRemovalDialog = new H5P.ConfirmationDialog({
      dialogText: H5PEditor.t('core', 'confirmRemoval', { ':type': this.entity.toLocaleLowerCase() }),
    }).appendTo(document.body);

    confirmRemovalDialog.on('confirmed', () => {
      this.removeRow(row);
    });

    return H5PEditor.createButton('remove', H5PEditor.t('core', 'removeItem'), function () {
      if (this.getAttribute('aria-disabled') !== 'true') {
        confirmRemovalDialog.show(this.getBoundingClientRect().top);
      }
    })[0];
  }

  /**
   * Remove row and keep ranges consistent, taken from H5PEditor.RangeList.
   * @param {object} row Row.
   */
  removeRow(row) {
    const index = this.rows.indexOf(row);
    const previousRow = this.rows[index - 1];
    const nextRow = this.rows[index + 1];

    if (!nextRow) {
      // This was the last row, previous row becomes last row
      if (previousRow) {
        previousRow.toText.style.display = '';
        previousRow.toInput.style.display = 'none';
        setValue(previousRow.toInput, this.max);

        if (!this.rows[index - 2]) {
          this.toggleButtons(false, previousRow);
        }
      }
    }
    else if (!previousRow) {
      // This was the first row, next row becomes first row
      setValue(nextRow.fromInput, this.min);

      if (!this.rows[index + 2]) {
        this.toggleButtons(false, nextRow);
      }
    }
    else {
      const previousTo = parseInt(previousRow.toInput.value);
      setValue(nextRow.fromInput, isNaN(previousTo) ? '' : Math.min(previousTo + 1, this.max));
    }

    this.list.removeItem(index);
    row.element.remove();
    this.rows.splice(index, 1);

    this.validateSequence();
  }

  /**
   * Mark overlapping ranges and show message, taken from H5PEditor.RangeList.
   */
  validateSequence() {
    let previousTo;
    let hasError = false;

    this.rows.forEach((row) => {
      const to = parseInt(row.toInput.value);
      const isOverlapping = previousTo !== undefined && !isNaN(to) && to <= previousTo;

      row.element.classList.toggle('h5p-error-range-overlap', isOverlapping);
      hasError = hasError || isOverlapping;
      previousTo = to;
    });

    this.messageArea.textContent = hasError ? t('rangeOutOfSequenceWarning') : '';
    this.messageArea.classList.toggle('problem-found', hasError);
  }

  /**
   * Create button to distribute ranges evenly, confirmed via dialog if author has defined ranges.
   * @returns {HTMLElement} Button.
   */
  createDistributeButton() {
    const confirmDialog = new H5P.ConfirmationDialog({
      dialogText: t('distributeButtonWarning'),
    }).appendTo(document.body);

    confirmDialog.on('confirmed', () => {
      this.distributeEvenly();
    });

    const that = this;
    return H5PEditor.createButton('h5peditor-range-distribute', t('distributeButtonLabel'), function () {
      if (this.getAttribute('aria-disabled') === 'true') {
        return;
      }

      if (that.hasAuthorDefinedRanges()) {
        confirmDialog.show(this.getBoundingClientRect().top);
      }
      else {
        that.distributeEvenly();
      }
    }, true)[0];
  }

  /**
   * Determine whether author has set any 'to' value.
   * @returns {boolean} True, if author has defined ranges.
   */
  hasAuthorDefinedRanges() {
    return this.rows.slice(0, -1).some((row) => !isNaN(parseInt(row.toInput.value)));
  }

  /**
   * Distribute ranges evenly.
   */
  distributeEvenly() {
    const rowRange = (this.max - this.min) / this.rows.length;

    this.rows.forEach((row, index) => {
      const from = this.min + rowRange * index;
      setValue(row.fromInput, Math.floor(from) + (index === 0 ? 0 : 1));
      setValue(row.toInput, Math.floor(from + rowRange));
      row.toInput.dispatchEvent(new Event('keyup')); // Workaround to remove error messages
    });

    this.validateSequence();
  }

  /**
   * Toggle remove button of row and distribute button.
   * @param {boolean} state If true, enable buttons, else disable them.
   * @param {object} row Row.
   */
  toggleButtons(state, row) {
    toggleButton(this.distributeButton, state);
    toggleButton(row.removeButton, state);
  }

  /**
   * Append widget to container.
   * @param {H5P.jQuery} $container Container.
   */
  appendTo($container) {
    $container[0].append(this.dom);
  }

  /**
   * Remove widget from DOM.
   */
  remove() {
    this.dom.remove();
  }
}
