import React from 'react';
import PropTypes from 'prop-types';
import EditingDialog from '@components/EditingDialog/EditingDialog.js';
import { H5PContext } from '@context/H5PContext.js';
import '@components/EditingDialog/InteractionEditor.css';
import { SceneTypes } from '@components/Scene/Scene.js';
import { getDefaultLibraryParams, getInteractionLabel, isGoToScene } from '@h5phelpers/libraryParams.js';
import { getSceneFromId } from '@h5phelpers/sceneParams.js';
import { getLibraryDataFromFields } from '@h5phelpers/editorForms.js';
import {
  createInteractionForm,
  sanitizeInteractionParams,
  validateInteractionForm,
} from '@h5phelpers/forms/interactionForm.js';
import GoToSceneWrapper from '@components/EditingDialog/GoToScene/GoToSceneWrapper.js';
import { sanitizeSceneForm, validateSceneForm } from '@h5phelpers/forms/sceneForm.js';

/** @constant {object} InteractionEditingType Interaction editing state identifiers. */
export const InteractionEditingType = {
  NOT_EDITING: null,
  NEW_INTERACTION: -1,
};

/**
 * Render interaction editor dialog.
 */
export default class InteractionEditor extends React.Component {
  /**
   * Create interaction editor component.
   * @param {object} props Component props.
   */
  constructor(props) {
    super(props);
    this.semanticsRef = React.createRef();

    this.state = {
      library: null,
      isInitialized: false,
      hasInputError: false,
    };
  }

  /**
   * Get parameters of interaction being edited.
   * @param {number} [interactionIndex] Index of interaction, new interaction when omitted.
   * @returns {object} Interaction parameters.
   */
  getInteractionParams = (interactionIndex = null) => {
    const isNewScene = interactionIndex === InteractionEditingType.NEW_INTERACTION;

    if (isNewScene) {
      return getDefaultLibraryParams(this.props.library.uberName);
    }

    const scenes = this.context.params.scenes;
    const scene = getSceneFromId(scenes, this.props.currentScene);
    return scene.interactions[interactionIndex];
  };

  /**
   * Get default position for new interaction.
   * @returns {object} Position with x and y.
   */
  getDefaultInteractionPosition = () => {
    const scenes = this.context.params.scenes;
    const scene = getSceneFromId(scenes, this.props.currentScene);

    if (scene.sceneType === SceneTypes.STATIC_SCENE) {
      // Place it in image center, % denotes that its placed on a static image.
      return { x: '50%', y: '50%' };
    }

    const camera = this.props.scenePreview.getCamera();

    return {
      x: `${camera.camera.yaw}`,
      y: `${camera.camera.pitch}`,
    };
  };

  /**
   * Get other interactions of current scene as options for connecting.
   * @returns {object[]} Options with interaction ID as value and interaction label as label.
   */
  getNeighborOptions = () => {
    const scene = getSceneFromId(this.context.params.scenes, this.props.currentScene);

    return (scene.interactions ?? [])
      .filter((interaction) => interaction.id !== this.params.id)
      .map((interaction) => ({ value: interaction.id, label: getInteractionLabel(interaction) }));
  };

  /**
   * Get other interactions of current scene that restrictions can refer to, excluding navigation buttons.
   * @returns {object[]} Options with interaction ID as value and interaction label as label.
   */
  getRestrictionOptions = () => {
    const scene = getSceneFromId(this.context.params.scenes, this.props.currentScene);

    return (scene.interactions ?? [])
      .filter((interaction) => interaction.id !== this.params.id && !isGoToScene(interaction))
      .map((interaction) => ({ value: interaction.id, label: getInteractionLabel(interaction) }));
  };

  /**
   * React - run after initial render.
   */
  async componentDidMount() {
    this.params = this.getInteractionParams(this.props.editingInteraction);
    const field = this.context.field;

    // Preserve parent's children
    this.parentChildren = this.context.parent.children;

    createInteractionForm(
      field,
      this.params,
      this.semanticsRef.current,
      this.context.parent,
      this.getNeighborOptions(),
      this.getRestrictionOptions(),
    );

    // Restore parent's children after preserving our own
    this.children = this.context.parent.children;
    this.context.parent.children = this.parentChildren;

    // Update state when library has loaded
    this.libraryWidget = this.children[2];
    const libraryLoadedCallback = () => {
      this.setState({
        isInitialized: true,
      });
    };

    // Check if children has been loaded, since ready() doesn't work for library
    if (this.libraryWidget.children && this.libraryWidget.children.length) {
      libraryLoadedCallback();
    }
    else {
      this.libraryWidget.change(libraryLoadedCallback);
    }

    const uberName = this.params.action.library;
    const library = await getLibraryDataFromFields(field, uberName);

    this.setState({
      library: library,
    });
  }

  /**
   * Handle done button click, validating and saving interaction.
   */
  handleDone = () => {
    const interactionIndex = this.props.editingInteraction;
    let interactionPosition = null;

    // Set default position if new interaction
    if (interactionIndex === InteractionEditingType.NEW_INTERACTION) {
      interactionPosition = this.getDefaultInteractionPosition();
    }

    // Return if scene is invalid
    if (this.scene && !this.validateScene()) {
      return;
    }

    this.params = sanitizeInteractionParams(this.params, interactionPosition);
    const isValid = validateInteractionForm(this.children);

    // Return to form with error messages if form is invalid
    if (!isValid) {
      this.setState({
        hasInputError: true,
      });
      return;
    }

    this.props.doneAction(this.params, this.scene && this.scene.params);
  };

  /**
   * Validate and sanitize new scene.
   * @returns {boolean} Whether new scene is valid.
   */
  validateScene = () => {
    const isValid = validateSceneForm(this.scene.children);
    if (!isValid) {
      return false;
    }

    const isThreeSixtyScene = this.scene.params.sceneType === SceneTypes.THREE_SIXTY_SCENE;

    sanitizeSceneForm(this.scene.params, isThreeSixtyScene, this.scene.params.cameraStartPosition);
    return true;
  };

  /**
   * Remove input error state.
   */
  removeInputErrors = () => {
    this.setState({
      hasInputError: false,
    });
  };

  /**
   * Store new scene.
   * @param {object} scene New scene to store.
   */
  setScene = (scene) => {
    this.scene = scene;
  };

  /**
   * React - create DOM elements.
   * @returns {React.Element} Rendered interaction editor element.
   */
  render() {
    let title = '';
    let className = '';

    if (this.state.library) {
      title = this.state.library.title;
      className = this.state.library.name.toLowerCase().replace('.', '-');
    }

    const semanticsClasses = ['semantics-wrapper'];
    if (this.state.isInitialized && isGoToScene(this.params)) {
      semanticsClasses.push('go-to-scene');
    }

    return (
      <EditingDialog
        title={title}
        titleClasses={[className]}
        removeAction={this.props.removeAction}
        doneAction={this.handleDone}
        doneLabel={this.context.t('done')}
        removeLabel={this.context.t('remove')}
      >
        <div className={semanticsClasses.join(' ')} ref={this.semanticsRef}/>
        {
          this.state.isInitialized && isGoToScene(this.params) &&
          <GoToSceneWrapper
            selectedScene={this.removeInputErrors}
            hasInputError={this.state.hasInputError}
            nextSceneIdWidget={this.libraryWidget.children[0]}
            currentScene={this.props.currentScene}
            params={this.params}
            setScene={this.setScene}
          />
        }
      </EditingDialog>
    );
  }
}

InteractionEditor.contextType = H5PContext;

InteractionEditor.propTypes = {
  currentScene: PropTypes.number.isRequired,
  library: PropTypes.shape({
    uberName: PropTypes.string.isRequired,
  }),
  scenePreview: PropTypes.shape({
    getCamera: PropTypes.func.isRequired,
  }),
  editingInteraction: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf(Object.values(InteractionEditingType)),
  ]),
  doneAction: PropTypes.func.isRequired,
  removeAction: PropTypes.func.isRequired,
};
