import React, { Component } from 'react';
import Rct from './components/rct';
export default class RedisInfo extends Component {
  static displayName = 'RedisInfo';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <Rct />
      </div>
    );
  }
}
