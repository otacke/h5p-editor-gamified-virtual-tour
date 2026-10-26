import React from 'react';
import PropTypes from 'prop-types';
import Scene, { SceneTypes } from '@components/Scene/Scene.js';
import ControlBar from '@components/ControlBar/ControlBar.js';
import SceneEditor, { SceneEditingType } from '@components/EditingDialog/SceneEditor.js';
import InteractionsBar from '@components/InteractionsBar/InteractionsBar.js';
import '@components/Main.css';
import InteractionEditor, { InteractionEditingType } from '@components/EditingDialog/InteractionEditor.js';
import { H5PContext } from '@context/H5PContext.js';
import { deleteScene, getSceneFromId, setScenePositionFromCamera, updateScene } from '@h5phelpers/sceneParams.js';
import { isGoToScene, updatePosition } from '@h5phelpers/libraryParams.js';
import { showConfirmationDialog } from '@h5phelpers/h5pComponents.js';
import { addBehavioralListeners } from '@h5phelpers/editorForms.js';
import { removeNeighbor, syncNeighbors, syncPaths } from '@h5phelpers/pathParams.js';

/**
 * Render gamified virtual tour editor.
 */
export default class Main extends React.Component {
  /**
   * Create main component.
   * @param {object} props Component props.
   */
  constructor(props) {
    super(props);

    this.scenePreview = null;

    this.state = {
      editingScene: SceneEditingType.NOT_EDITING,
      editingLibrary: null,
      editingInteraction: InteractionEditingType.NOT_EDITING,
      currentScene: this.props.initialScene,
      startScene: this.props.initialScene,
      isSceneUpdated: false,
      isSceneSelectorExpanded: false,
      currentCameraPosition: null,
    };
  }

  /**
   * React - run after initial render.
   */
  componentDidMount() {
    addBehavioralListeners(this.context.parent, () => {
      this.setState({
        isSceneUpdated: false,
      });
    });
  }

  /**
   * Start editing scene.
   * @param {number} [sceneId] ID of scene to edit, new scene when omitted.
   */
  editScene = (sceneId = SceneEditingType.NEW_SCENE) => {
    this.toggleExpandSceneSelector(false);
    this.setState({
      editingScene: sceneId,
    });
  };

  /**
   * Change current scene when current scene is deleted.
   * @param {number} deletedSceneId ID of deleted scene.
   */
  updateCurrentScene = (deletedSceneId) => {
    const hasDeletedCurrentScene = deletedSceneId === this.state.currentScene;
    if (!hasDeletedCurrentScene) {
      return;
    }

    const scenes = this.context.params.scenes;
    if (scenes.length) {
      // Find the first scene that is not current scene and jump to it
      const newScene = scenes[0];
      this.changeScene(newScene.sceneId);
      return;
    }

    // No scenes left
    this.changeScene(SceneTypes.NO_SCENE);
  };

  /**
   * Change start scene when start scene is deleted.
   * @param {number} deletedSceneId ID of deleted scene.
   */
  updateStartScene = (deletedSceneId) => {
    const hasDeletedStartScene = deletedSceneId === this.state.startScene;
    if (!hasDeletedStartScene) {
      return;
    }

    let startScene = null;
    const scenes = this.context.params.scenes;
    if (scenes.length) {
      const newScene = scenes[0];
      startScene = newScene.sceneId;
    }

    // No scenes left
    this.setStartScene(startScene);
  };

  /**
   * Show delete confirmation for scene.
   * @param {number} sceneId ID of scene to delete.
   */
  deleteScene = (sceneId) => {
    const isNewScene = sceneId === SceneEditingType.NEW_SCENE;
    const deleteSceneText = isNewScene
      ? this.context.t('deleteSceneText')
      : this.context.t('deleteSceneTextWithObjects');

    // Confirm deletion
    showConfirmationDialog({
      headerText: this.context.t('deleteSceneTitle'),
      dialogText: deleteSceneText,
      cancelText: this.context.t('cancel'),
      confirmText: this.context.t('confirm'),
    }, () => this.confirmedDeleteScene(sceneId));
  };

  /**
   * Delete scene after confirmation.
   * @param {number} sceneId ID of scene to delete.
   */
  confirmedDeleteScene = (sceneId) => {
    this.setState({
      editingScene: SceneEditingType.NOT_EDITING,
      isSceneSelectorExpanded: false,
    });

    // Scene not added to params
    const isNewScene = sceneId === SceneEditingType.NEW_SCENE;
    if (isNewScene) {
      return;
    }

    const scenes = this.context.params.scenes;
    const scene = getSceneFromId(scenes, sceneId);
    this.context.params.scenes = deleteScene(scenes, sceneId);

    this.updateCurrentScene(scene.sceneId);
    this.updateStartScene(scene.sceneId);
    this.setState({
      isSceneUpdated: false,
    });
  };

  /**
   * Save edited or new scene.
   * @param {object} params Parameters of scene.
   * @param {number} [editingScene] ID of scene being edited, current state when omitted.
   * @param {boolean} [skipChangingScene] Whether to skip changing current scene.
   */
  doneEditingScene = (params, editingScene = null, skipChangingScene = false) => {
    const scenes = this.context.params.scenes;
    editingScene = editingScene || this.state.editingScene;
    const isEditing = editingScene !== SceneEditingType.NEW_SCENE;

    // Add as start scene if this is the first scene we add
    if (!this.context.params.scenes.length) {
      this.setStartScene(params.sceneId);
    }

    this.context.params.scenes = updateScene(scenes, params, editingScene);

    // Set current scene
    const isChangingScene = !(skipChangingScene || isEditing);

    this.setState((prevState) => {
      return {
        isSceneUpdated: false,
        currentScene: isChangingScene ? params.sceneId : prevState.currentScene,
        editingScene: SceneEditingType.NOT_EDITING,
      };
    });
  };

  /**
   * Show delete confirmation for interaction.
   * @param {number} [interactionIndex] Index of interaction to delete, editing interaction when omitted.
   */
  removeInteraction = (interactionIndex = null) => {
    showConfirmationDialog({
      headerText: this.context.t('deleteInteractionTitle'),
      dialogText: this.context.t('deleteInteractionText'),
      cancelText: this.context.t('cancel'),
      confirmText: this.context.t('confirm'),
    }, () => this.confirmRemoveInteraction(interactionIndex));
  };

  /**
   * Delete interaction after confirmation.
   * @param {number} [interactionIndex] Index of interaction to delete, editing interaction when omitted.
   */
  confirmRemoveInteraction = (interactionIndex = null) => {
    let editingInteraction = interactionIndex;
    if (editingInteraction === null) {
      editingInteraction = this.state.editingInteraction;
    }

    // No interactions has been added yet
    if (editingInteraction === SceneEditingType.NEW_SCENE) {
      this.setState({
        editingInteraction: SceneEditingType.NOT_EDITING,
      });
      return;
    }

    const scenes = this.context.params.scenes;
    const scene = getSceneFromId(scenes, this.state.currentScene);
    const [removedInteraction] = scene.interactions.splice(editingInteraction, 1);
    removeNeighbor(scene, removedInteraction.id);
    syncPaths(scene);

    this.setState({
      editingInteraction: SceneEditingType.NOT_EDITING,
      isSceneUpdated: false,
    });
  };

  /**
   * Save edited or new interaction.
   * @param {object} params Parameters of interaction.
   * @param {object} [sceneParams] Parameters of new scene to save at same time.
   */
  editInteraction = (params, sceneParams = null) => {
    // Creating scene as well
    if (sceneParams) {
      this.doneEditingScene(sceneParams, SceneEditingType.NEW_SCENE, true);
    }

    const scenes = this.context.params.scenes;
    const scene = getSceneFromId(scenes, this.state.currentScene);
    if (!scene.interactions) {
      scene.interactions = [];
    }

    const isEditing = this.state.editingInteraction !== InteractionEditingType.NEW_INTERACTION;

    let interactionIndex = null;
    if (isEditing) {
      scene.interactions[this.state.editingInteraction] = params;
      interactionIndex = this.state.editingInteraction;
    }
    else {
      scene.interactions.push(params);
      interactionIndex = scene.interactions.length - 1;
    }

    syncNeighbors(scene, params);
    syncPaths(scene);
    this.scenePreview.trigger('focusInteraction', [interactionIndex, isEditing]);

    this.setState({
      editingInteraction: InteractionEditingType.NOT_EDITING,
      isSceneUpdated: false,
    });
    this.scenePreview.trigger('updateEditStateInteraction');
  };

  /**
   * Change current scene.
   * @param {number} sceneId ID of scene to switch to.
   */
  changeScene = (sceneId) => {
    this.setState({
      isSceneUpdated: false,
      currentScene: sceneId,
      isSceneSelectorExpanded: false,
    });
  };

  /**
   * Set start scene.
   * @param {number} sceneId ID of scene to use as start scene.
   */
  setStartScene = (sceneId) => {
    this.context.params.startSceneId = sceneId;
    this.setState({
      startScene: sceneId,
    });
  };

  /**
   * Mark scene as initialized.
   */
  sceneIsInitialized = () => {
    this.setState({
      isSceneUpdated: true,
    });
  };

  /**
   * Start creating interaction.
   * @param {object} library Library to create interaction with.
   */
  createInteraction = (library) => {
    this.setState({
      editingInteraction: InteractionEditingType.NEW_INTERACTION,
      editingLibrary: library,
    });
  };

  /**
   * Handle updating camera start position when button is pressed.
   */
  handleSetStartingPosition = () => {
    const camera = this.scenePreview.getCamera().camera;
    setScenePositionFromCamera(this.context.params.scenes, this.state.currentScene, camera);
    this.setState({
      currentCameraPosition: { yaw: `${camera.yaw}`, pitch: `${camera.pitch}` },
    });
  };

  /**
   * Get interaction from index.
   * @param {number} index Index of interaction in current scene.
   * @returns {object} Interaction at index.
   */
  getInteractionFromIndex = (index) => {
    const scenes = this.context.params.scenes;
    const scene = getSceneFromId(scenes, this.state.currentScene);
    return scene.interactions[index];
  };

  /**
   * Store scene preview and add event listeners.
   * @param {object} scene Scene preview to add listeners to.
   */
  setScenePreview = (scene) => {
    this.scenePreview = scene;

    this.scenePreview.off('doubleClickedInteraction');
    this.scenePreview.on('doubleClickedInteraction', (e) => {
      const interactionIndex = e.data;
      const interaction = this.getInteractionFromIndex(interactionIndex);
      if (isGoToScene(interaction)) {
        const nextSceneId = parseInt(interaction.action.params.nextSceneId);
        this.changeScene(nextSceneId);
        return;
      }

      this.setState({
        editingInteraction: interactionIndex,
      });
    });

    this.scenePreview.off('goToScene');
    this.scenePreview.on('goToScene', (e) => {
      const interaction = this.getInteractionFromIndex(e.data);
      if (!isGoToScene(interaction)) {
        return;
      }

      const nextSceneId = parseInt(interaction.action.params.nextSceneId);
      this.changeScene(nextSceneId);
    });

    this.scenePreview.off('editInteraction');
    this.scenePreview.on('editInteraction', (e) => {
      const interactionIndex = e.data;
      this.setState({
        editingInteraction: interactionIndex,
      });
    });

    this.scenePreview.off('deleteInteraction');
    this.scenePreview.on('deleteInteraction', (e) => {
      this.removeInteraction(e.data);
    });

    this.scenePreview.off('movestop');
    this.scenePreview.on('movestop', (e) => {
      if (!e.data) {
        return;
      }

      if (e.data.target) {
        const index = this.scenePreview.threeSixty.indexOf(e.data.target);

        // This is an element
        updatePosition(this.context.params.scenes, this.state.currentScene, index, e.data);
      }
      else {
        // This is the camera
        this.setState({
          currentCameraPosition: { yaw: `${e.data.yaw}`, pitch: `${e.data.pitch}` },
        });
      }
    });

    this.scenePreview.on('changedScene', (e) => {
      this.setState({
        currentScene: e.data,
      });
    });
  };

  /**
   * Toggle expanded state of scene selector.
   * @param {boolean} [forceState] State to force, toggling current state when omitted.
   */
  toggleExpandSceneSelector = (forceState) => {
    // Disabled
    if (this.state.currentScene === null) {
      return;
    }

    this.setState((prevState) => {
      const isExpanded = forceState !== undefined ? forceState : !prevState.isSceneSelectorExpanded;
      return {
        isSceneSelectorExpanded: isExpanded,
      };
    });
  };

  /**
   * Close scene selector overlay.
   */
  handleCloseSceneOverlay = () => {
    this.toggleExpandSceneSelector(false);
  };

  /**
   * React - create DOM elements.
   * @returns {React.Element} Rendered main editor element.
   */
  render() {
    const hasScenes = this.context.params.scenes.length > 0;
    const scene = getSceneFromId(this.context.params.scenes, this.state.currentScene);

    const isInStartingPosition = this.state.currentCameraPosition === null || !scene || (
      scene.cameraStartPosition?.yaw === this.state.currentCameraPosition.yaw &&
      scene.cameraStartPosition?.pitch === this.state.currentCameraPosition.pitch
    );

    return (
      <div>
        <div className='scene-editor'>
          <InteractionsBar
            isShowing={this.state.isSceneUpdated && hasScenes}
            createInteraction={this.createInteraction}
          />
          <Scene
            isSceneUpdated={this.state.isSceneUpdated}
            sceneIsInitialized={this.sceneIsInitialized}
            setScenePreview={this.setScenePreview}
            currentScene={this.state.currentScene}
            hasOverlay={this.state.isSceneSelectorExpanded}
            onCloseOverlay={ this.handleCloseSceneOverlay }
          />
        </div>
        <ControlBar
          currentScene={this.state.currentScene}
          editScene={this.editScene}
          deleteScene={this.deleteScene}
          newScene={this.editScene}
          changeScene={this.changeScene}
          setStartScene={this.setStartScene}
          startScene={this.state.startScene}
          onSetStartingPosition={ this.handleSetStartingPosition }
          isInStartingPosition={ isInStartingPosition }
          isSceneSelectorExpanded={this.state.isSceneSelectorExpanded}
          toggleExpandSceneSelector={this.toggleExpandSceneSelector}
        />
        {
          // TODO: Refactor to single editor dialog since they can never be shown together
          (this.state.editingScene !== SceneEditingType.NOT_EDITING) &&
          <SceneEditor
            removeAction={() => this.deleteScene(this.state.editingScene)}
            doneAction={this.doneEditingScene}
            editingScene={this.state.editingScene}
          />
        }
        {
          this.state.editingInteraction !== InteractionEditingType.NOT_EDITING &&
          <InteractionEditor
            removeAction={() => this.removeInteraction(this.state.editingInteraction)}
            doneAction={this.editInteraction}
            scenePreview={this.scenePreview}
            currentScene={this.state.currentScene}
            editingInteraction={this.state.editingInteraction}
            library={this.state.editingLibrary}
          />
        }
      </div>
    );
  }
}

Main.contextType = H5PContext;

Main.propTypes = {
  initialScene: PropTypes.number,
};
