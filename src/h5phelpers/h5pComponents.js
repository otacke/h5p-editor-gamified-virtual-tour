/**
 * Initialize three sixty preview from parameters.
 * @param {object} container DOM element to initialize preview in.
 * @param {object} params Content parameters.
 * @param {object} l10n Language strings for preview.
 * @returns {object} Initialized runnable instance.
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
 * Show confirmation dialog.
 * @param {object} dialogOptions Options for confirmation dialog (title and text).
 * @param {function} confirm Callback to run when dialog is confirmed.
 * @param {function} cancel Callback to run when dialog is canceled.
 */
export const showConfirmationDialog = (dialogOptions, confirm, cancel) => {
  const deleteDialog = new H5P.ConfirmationDialog(dialogOptions).appendTo(document.body);

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
