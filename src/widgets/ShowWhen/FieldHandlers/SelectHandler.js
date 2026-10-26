import FieldHandler from '@src/widgets/ShowWhen/FieldHandlers/FieldHandler.js';

export default class SelectHandler extends FieldHandler {
  /**
   * Check whether selected value is one of expected values.
   * @returns {boolean} True if condition is satisfied, else false.
   */
  satisfied() {
    return this.equals.includes(this.field.value);
  }
}
