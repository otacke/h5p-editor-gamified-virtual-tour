import React from 'react';
import './NoScene.css';
import { H5PContext } from '../../context/H5PContext.js';

export default class NoScene extends React.Component {
  render() {
    return (
      <div className='no-scene-container'>
        <div className="no-scene-wrapper">
          <div className="title">{ this.context.t('noScenesTitle') }</div>
          <div className="description">{ this.context.t('noScenesDescription') }</div>
        </div>
      </div>
    );
  }
}

NoScene.contextType = H5PContext;
