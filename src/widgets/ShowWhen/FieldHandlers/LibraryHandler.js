import FieldHandler from '@src/widgets/ShowWhen/FieldHandlers/FieldHandler.js';

export default class LibraryHandler extends FieldHandler {
  /**
   * Check whether machine name of selected library is one of expected values, taken from H5PEditor.ShowWhen.
   * @returns {boolean} True if condition is satisfied, else false.
   */
  satisfied() {
    if (this.field.currentLibrary === undefined || !this.field.params?.library) {
      return false;
    }

    return this.equals.includes(this.field.currentLibrary.split(' ')[0]);
  }
}
