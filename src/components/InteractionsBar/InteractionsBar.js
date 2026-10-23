import React from 'react';
import PropTypes from 'prop-types';
import './InteractionsBar.css';
import { getLibraries, H5PContext } from '../../context/H5PContext.js';

/**
 * Render bar with buttons to create interactions.
 */
export default class InteractionsBar extends React.Component {
  /**
   * Create interactions bar component.
   * @param {object} props Component props.
   */
  constructor(props) {
    super(props);

    this.state = {
      isInitialized: false,
      libraries: null,
    };
  }

  /**
   * React - run after initial render.
   */
  async componentDidMount() {
    const libraries = await getLibraries(this.context.field);
    this.setState({
      isInitialized: true,
      libraries: libraries,
    });
  }

  /**
   * React - create DOM elements.
   * @returns {React.Element|null} Rendered interactions bar element, or null if not showing.
   */
  render() {
    if (!this.props.isShowing) {
      return null;
    }

    if (!this.state.isInitialized) {
      return <div>{this.context.t('loading')}...</div>;
    }

    return (
      <div className='h5p-interactions-bar'>
        {
          this.state.libraries.map((library) => {
            const className = library.name
              .toLowerCase()
              .replace('.', '-');

            return (
              <button
                className={className}
                key={library.name}
                onClick={() => this.props.createInteraction(library)}
              >
                <div className='tooltip'>{library.title}</div>
              </button>
            );
          })
        }
      </div>
    );
  }
}

InteractionsBar.contextType = H5PContext;

InteractionsBar.propTypes = {
  isShowing: PropTypes.bool,
  createInteraction: PropTypes.func.isRequired,
};