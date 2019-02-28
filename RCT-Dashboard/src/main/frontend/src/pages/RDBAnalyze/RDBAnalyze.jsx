import React, { Component } from 'react';
import RDBMain from './components/RDBMain';

export default class RDBAnalyze extends Component {
  static displayName = 'RDBAnalyze';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <RDBMain />
      </div>
    );
  }
}