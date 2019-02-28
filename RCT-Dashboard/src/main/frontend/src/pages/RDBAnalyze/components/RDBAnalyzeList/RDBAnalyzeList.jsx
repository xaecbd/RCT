import React, { Component } from 'react';
import IceContainer from '@icedesign/container';
import RDBRedisInfo from '../RDBRedisInfo';

export default class RDBAnalyzeList extends Component {
  constructor(props) {
    super(props);
    const pid = sessionStorage.getItem('pid');
    this.state = {
      pid,
    };
  }
  render() {
    return (
      <IceContainer>
        {/* <RDBRedisInfo pid={this.state.pid} /> */}
      </IceContainer>
    );
  }
}
