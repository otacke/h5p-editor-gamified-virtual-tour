/** @constant {string} TYPE_AND AND operator name. */
export const TYPE_AND = 'and';

/** @constant {string} TYPE_OR OR operator name. */
export const TYPE_OR = 'or';

export default class RuleHandler {
  /**
   * Create handler that combines rules.
   * @param {string} [type] Rule type, TYPE_AND or TYPE_OR.
   */
  constructor(type = TYPE_OR) {
    this.type = type;
    this.handlers = [];
  }

  /**
   * Add field handler.
   * @param {object} handler Field handler to add.
   */
  add(handler) {
    this.handlers.push(handler);
  }

  /**
   * Check whether rules are satisfied.
   * @returns {boolean} True if all (TYPE_AND) or any (TYPE_OR) rules are satisfied, else false.
   */
  rulesSatisfied() {
    if (this.type === TYPE_AND) {
      return this.handlers.every((handler) => handler.satisfied());
    }

    return this.handlers.some((handler) => handler.satisfied());
  }
}
