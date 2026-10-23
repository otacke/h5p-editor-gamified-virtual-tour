import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SceneTypes } from '../../../Scene/Scene.js';
import './SceneRow.css';
import { getImageSource } from '../../../../context/H5PContext.js';
import { H5PContext } from '../../../../context/H5PContext.js';

/** @constant {number} AspectRatioWidth Width of thumbnail aspect ratio. */
const AspectRatioWidth = 4;

/** @constant {number} AspectRatioHeight Height of thumbnail aspect ratio. */
const AspectRatioHeight = 3;

/**
 * Render scene row with thumbnail and scene name.
 */
export default class SceneRow extends Component {
  /**
   * Create scene row component.
   * @param {object} props Component props.
   */
  constructor(props) {
    super(props);

    this.imageRef = React.createRef();

    this.state = {
      isVerticalImage: false,
    };
  }

  /**
   * Check if thumbnail image is vertical.
   */
  onImageLoad = () => {
    const image = this.imageRef.current;
    const ratio = AspectRatioWidth / AspectRatioHeight;

    this.setState({
      isVerticalImage: image.naturalWidth / image.naturalHeight < ratio,
    });
  };

  /**
   * Trigger scene click handler.
   */
  onSceneClick = () => {
    if (this.props.onSceneClick) {
      this.props.onSceneClick(this.props.scene.sceneId);
    }
  };

  /**
   * Trigger title click handler.
   */
  onTitleClick = () => {
    if (this.props.onTitleClick) {
      this.props.onTitleClick(this.props.scene.sceneId);
    }
  };

  /**
   * React - create DOM elements.
   * @returns {React.Element} Rendered scene row element.
   */
  render() {

    const rowClasses = ['h5p-scene-row'];
    if (this.props.scene.sceneType === SceneTypes.THREE_SIXTY_SCENE) {
      rowClasses.push('three-sixty');
    }

    if (this.props.isMarkedScene) {
      rowClasses.push('marked-scene');

      if (this.props.isShowingCheck) {
        rowClasses.push('checked');
      }
    }

    if (this.props.isAfterActiveScene) {
      rowClasses.push('no-top-border');
    }

    const imageClasses = ['scene-thumbnail'];
    if (this.state.isVerticalImage) {
      imageClasses.push('vertical');
    }

    return (
      <div
        className={rowClasses.join(' ')}
        onClick={this.onSceneClick}
      >
        <div className='thumbnail-wrapper'>
          <img
            className={imageClasses.join(' ')}
            src={getImageSource(this.props.scene.scenesrc.path)}
            alt={this.props.scene.scenesrc.alt}
            onLoad={this.onImageLoad}
            ref={this.imageRef}
          />
        </div>
        <div className='scene-wrapper'>
          <div
            className='h5p-scene-name'
            onClick={this.onTitleClick}
            dangerouslySetInnerHTML={ { __html: this.props.scene.scenename } }
          ></div>
          {
            this.props.isStartScene &&
            <div className='starting-scene'>{this.context.t('startingScene')}</div>
          }
        </div>
        {this.props.children}
      </div>
    );
  }
}

SceneRow.contextType = H5PContext;

SceneRow.propTypes = {
  scene: PropTypes.shape({
    sceneType: PropTypes.oneOf(Object.values(SceneTypes)).isRequired,
    scenename: PropTypes.string.isRequired,
    scenesrc: PropTypes.shape({
      path: PropTypes.string.isRequired,
      alt: PropTypes.string,
    }).isRequired,
  }),
  isMarkedScene: PropTypes.bool,
  isShowingCheck: PropTypes.bool,
  isAfterActiveScene: PropTypes.bool,
  isStartScene: PropTypes.bool,
  onSceneClick: PropTypes.func,
  onTitleClick: PropTypes.func,
  children: PropTypes.node,
};
