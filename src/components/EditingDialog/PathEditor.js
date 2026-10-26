import React from 'react';
import PropTypes from 'prop-types';
import EditingDialog from '@components/EditingDialog/EditingDialog.js';
import { H5PContext } from '@context/H5PContext.js';
import { getSceneFromId } from '@h5phelpers/sceneParams.js';
import { getPath } from '@h5phelpers/pathParams.js';
import { getInteractionLabel } from '@h5phelpers/libraryParams.js';
import { createPathForm, validatePathForm } from '@h5phelpers/forms/pathForm.js';

/**
 * Render path editor dialog for visual settings of path.
 */
export default class PathEditor extends React.Component {
  /**
   * Create path editor component.
   * @param {object} props Component props.
   */
  constructor(props) {
    super(props);

    this.semanticsRef = React.createRef();
  }

  /**
   * Get scene that contains path.
   * @returns {object} Scene parameters.
   */
  getScene = () => {
    return getSceneFromId(this.context.params.scenes, this.props.currentScene);
  };

  /**
   * Get title of dialog naming both connected interactions.
   * @returns {string} Dialog title.
   */
  getTitle = () => {
    const interactions = this.getScene().interactions ?? [];
    const labels = [this.props.editingPath.from, this.props.editingPath.to].map((id) => {
      const interaction = interactions.find((interaction) => interaction.id === id);
      return interaction ? getInteractionLabel(interaction) : '';
    });

    return `${this.context.t('path')}: ${labels.join(' – ')}`;
  };

  /**
   * React - run after initial render.
   */
  componentDidMount() {
    this.params = getPath(this.getScene(), this.props.editingPath.from, this.props.editingPath.to);
    if (!this.params) {
      return;
    }

    // Preserve parent's children
    this.parentChildren = this.context.parent.children;

    createPathForm(this.context.field, this.params, this.semanticsRef.current, this.context.parent);

    // Capture own children and restore parent
    this.children = this.context.parent.children;
    this.context.parent.children = this.parentChildren;
  }

  /**
   * Handle done button click, validating path settings.
   */
  handleDone = () => {
    if (this.children && !validatePathForm(this.children)) {
      return;
    }

    this.props.doneAction();
  };

  /**
   * React - create DOM elements.
   * @returns {React.Element} Rendered path editor element.
   */
  render() {
    return (
      <EditingDialog
        title={this.getTitle()}
        titleClasses={['path']}
        removeAction={this.props.removeAction}
        doneAction={this.handleDone}
        doneLabel={this.context.t('done')}
        removeLabel={this.context.t('remove')}
      >
        <div ref={this.semanticsRef}/>
      </EditingDialog>
    );
  }
}

PathEditor.contextType = H5PContext;

PathEditor.propTypes = {
  currentScene: PropTypes.number.isRequired,
  editingPath: PropTypes.shape({
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }).isRequired,
  doneAction: PropTypes.func.isRequired,
  removeAction: PropTypes.func.isRequired,
};
