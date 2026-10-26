import FieldHandler from '@src/widgets/ShowWhen/FieldHandlers/FieldHandler.js';

export default class BooleanHandler extends FieldHandler {
  /**
   * Check whether boolean value equals expected value.
   * @returns {boolean} True if condition is satisfied, else false.
   */
  satisfied() {
    return this.field.value === this.equals;
  }
}
