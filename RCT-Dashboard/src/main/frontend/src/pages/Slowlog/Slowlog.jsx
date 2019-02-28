import React, { Component } from 'react';
import SlowlogMain from './components/SlowlogMain';

export default class Slowlog extends Component {
  static displayName = 'SlowlogAnaylzeList';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <SlowlogMain />
      </div>
    );
  }
}
