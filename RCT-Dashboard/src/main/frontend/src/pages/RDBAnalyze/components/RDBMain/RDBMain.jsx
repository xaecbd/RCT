import React, { Component } from 'react';
import IceContainer from '@icedesign/container';
import RDBMainPage from './RDBMainPage';

export default class RDBMain extends Component {
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
        <RDBMainPage pid={this.state.pid} />
      </IceContainer>
    );
  }
}
