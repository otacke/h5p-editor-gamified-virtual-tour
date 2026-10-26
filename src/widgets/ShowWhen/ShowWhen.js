import RuleHandler from '@src/widgets/ShowWhen/RuleHandler.js';
import SelectHandler from '@src/widgets/ShowWhen/FieldHandlers/SelectHandler.js';
import BooleanHandler from '@src/widgets/ShowWhen/FieldHandlers/BooleanHandler.js';
import '@src/widgets/ShowWhen/ShowWhen.css';

/**
 * Create field handler for type of field.
 * @param {object} field Field to handle.
 * @param {string|string[]|boolean} equals Value or values to compare against.
 * @returns {object|null} Field handler, or null if field type is not supported.
 */
const createFieldHandler = (field, equals) => {
  switch (field?.field?.type) {
    case 'select':
      return new SelectHandler(field, equals);

    case 'boolean':
      return new BooleanHandler(field, equals);

    default:
      return null;
  }
};

/**
 * Show field only if rules are satisfied, taken from H5PEditor.GameMap.
 * Unlike H5PEditor.ShowWhen, it passes through children and changes of the field it enhances (HFP-4196).
 */
export default class ShowWhen {
  /**
   * Create show when widget.
   * @param {object} parent Parent widget.
   * @param {object} field Semantics field.
   * @param {object} params Parameters of field.
   * @param {function} setValue Callback to set parameters.
   */
  constructor(parent, field, params, setValue) {
    this.field = field;
    this.passReadies = true;
    this.value = params;
    this.showing = false;

    // Allow other fields to listen to changes of enhanced field
    this.changes = [];

    this.$wrapper = H5P.jQuery('<div>', { class: 'field h5p-editor-widget-gamified-virtual-tour-show-when' });

    const config = this.field.gamifiedVirtualTourShowWhen;
    if (!config) {
      throw new Error('You need to set the gamifiedVirtualTourShowWhen property in semantics.json');
    }

    this.ruleHandler = new RuleHandler(config.type);

    config.rules.forEach((rule) => {
      const handler = createFieldHandler(H5PEditor.findField(rule.field, parent), rule.equals);
      if (!handler) {
        return;
      }

      this.ruleHandler.add(handler);

      H5PEditor.followField(parent, rule.field, () => {
        this.showing = this.ruleHandler.rulesSatisfied();
        this.$wrapper.toggleClass('display-none', !this.showing);

        if (config.nullWhenHidden && !this.showing) {
          setValue(this.field, undefined);
        }
      });
    });

    this.fieldInstance = new H5PEditor.widgets[config.widget || field.type](parent, field, params, setValue);
    this.fieldInstance.appendTo(this.$wrapper);

    this.children = this.fieldInstance.children;

    this.fieldInstance.changes?.push((value) => {
      this.value = value;
      this.changes.forEach((change) => change(value));
    });

    if (typeof this.fieldInstance.change === 'function') {
      this.change = (callback) => {
        this.fieldInstance.change(callback);
      };
    }
  }

  /**
   * Append widget to form.
   * @param {H5P.jQuery|HTMLElement} $container Container to append to.
   */
  appendTo($container) {
    this.$wrapper.appendTo($container);
  }

  /**
   * Validate widget, only if it is shown.
   * @returns {boolean} True if value is valid or field is hidden, else false.
   */
  validate() {
    return this.showing ? this.fieldInstance.validate() : true;
  }

  /**
   * Remove widget from form.
   */
  remove() {
    this.$wrapper.remove();
  }
}
