export default class FieldHandler {
  /**
   * Create handler that checks value of field.
   * @param {object} field Field to handle.
   * @param {string|string[]|boolean} equals Value or values to compare against.
   */
  constructor(field, equals) {
    this.field = field;
    this.equals = typeof equals === 'string' ? [equals] : equals;
  }

  /**
   * Check whether condition is satisfied, must be implemented by subclass.
   */
  satisfied() {
    throw new Error('Must be implemented by subclass');
  }
}
