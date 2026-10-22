/**
 * Initializes Three Sixty content from parameters
 * @param {object} container The DOM element to initialize the preview in.
 * @param {object} params The content parameters.
 * @param {object} l10n The language strings to use in the preview.
 * @returns {object} The initialized runnable instance.
 */
export const initializeThreeSixtyPreview = (container, params, l10n) => {
  const library = Object.keys(H5PEditor.libraryLoaded)
    .filter((library) => {
      return library.split(' ')[0] === 'H5P.GamifiedVirtualTour';
    })[0];

  return H5P.newRunnable(
    {
      library: library,
      params: params,
    },
    H5PEditor.contentId,
    H5P.jQuery(container),
    undefined,
    {
      isEditor: true,
      l10n,
    },
  );
};

/**
 * Shows confirmation dialog
 * @param {object} dialogOptions Options for the confirmation dialog (title and text).
 * @param {function} confirm Callback called when the dialog is confirmed.
 * @param {function} cancel Callback called when the dialog is canceled.
 */
export const showConfirmationDialog = (dialogOptions, confirm, cancel) => {
  const deleteDialog = new H5P.ConfirmationDialog(dialogOptions)
    .appendTo(document.body);

  deleteDialog.on('confirmed', () => {
    if (confirm) {
      confirm();
    }
  });

  deleteDialog.on('canceled', () => {
    if (cancel) {
      cancel();
    }
  });

  deleteDialog.show();
};
