import React from 'react';
import PropTypes from 'prop-types';
import NoScene from '@components/Scene/NoScene.js';
import '@components/Scene/Scene.css';
import { H5PContext } from '@context/H5PContext.js';
import { initializeThreeSixtyPreview } from '@h5phelpers/h5pComponents.js';

/** @constant {object} SceneTypes Scene type identifiers. */
export const SceneTypes = {
  THREE_SIXTY_SCENE: '360',
  STATIC_SCENE: 'static',
  NO_SCENE: null,
};

/**
 * Render scene preview in editor.
 */
export default class Scene extends React.Component {
  /**
   * Create scene component.
   * @param {object} props Component props.
   */
  constructor(props) {
    super(props);
    this.previewRef = React.createRef();

    this.state = {
      isInitialized: false,
    };

    /**
     * Trigger resize on preview.
     */
    this.handleResize = () => {
      this.preview.trigger('resize');
    };
  }

  /**
   * React - run after initial render.
   */
  componentDidMount() {
    this.initializePreview();
  }

  /**
   * React - run before unmount.
   */
  componentWillUnmount() {
    H5P.$window.off('resize', this.handleResize);
  }

  /**
   * React - update after render.
   */
  componentDidUpdate() {
    if (this.props.isSceneUpdated) {
      return;
    }

    if (!this.state.isInitialized) {
      this.initializePreview();
      return;
    }

    this.redrawScene();
  }

  /**
   * Set preview as active scene.
   */
  setAsActiveScene() {
    this.props.setScenePreview(this.preview);
    this.props.sceneIsInitialized();
  }

  /**
   * Redraw scene in preview.
   */
  redrawScene() {
    this.preview.reDraw(this.props.currentScene);
    this.setAsActiveScene();
  }

  /**
   * Initialize three sixty preview.
   */
  initializePreview() {
    if (this.context.params.scenes.length <= 0) {
      return;
    }

    this.preview = initializeThreeSixtyPreview(
      this.previewRef.current,
      this.context.parent.params,
      {
        edit: this.context.t('edit'),
        delete: this.context.t('delete'),
        goToScene: this.context.t('goToScene'),
      },
    );

    this.preview.updateParams(this.context.params);

    H5P.$window.on('resize', this.handleResize);


    this.setAsActiveScene();

    this.setState({
      isInitialized: true,
    });
  }

  /**
   * React - create DOM elements.
   * @returns {React.Element} Rendered scene element.
   */
  render() {
    const sceneClasses = ['scene-wrapper'];
    const hasNoScenes = this.context.params.scenes.length <= 0;
    if (hasNoScenes) {
      sceneClasses.push('no-scenes');
    }

    return (
      <div className={sceneClasses.join(' ')}>
        {
          hasNoScenes &&
          <NoScene/>
        }
        <div className='scene-container' ref={this.previewRef} aria-hidden={ this.props.hasOverlay } />
        {
          this.props.hasOverlay &&
          <button
            className='scene-overlay'
            aria-label={ this.context.t('closeSceneSelector') }
            aria-controls={ 'scene-selector' }
            onClick={ this.props.onCloseOverlay }
          />
        }
      </div>
    );
  }
}

Scene.contextType = H5PContext;

Scene.propTypes = {
  isSceneUpdated: PropTypes.bool,
  hasOverlay: PropTypes.bool,
  currentScene: PropTypes.number,
  sceneIsInitialized: PropTypes.func.isRequired,
  setScenePreview: PropTypes.func.isRequired,
};
