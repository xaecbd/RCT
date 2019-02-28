import React, { Component } from 'react';
import ClientMain from './components/ClientMain';

export default class ClientList extends Component {
  static displayName = 'ClientConAnaylze';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {

    return (
      <div  style={{minHeight:'100%',position:'relative'}}>
        <ClientMain />
      </div>
    );
  }
}
