import React, { Component } from 'react';
import IceContainer from '@icedesign/container';
import KeyCountTable from './KeyCountTable';


export default class PrefixKeyTable extends Component {
  static displayName = 'ClientList';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.queryCache = {};
  }

  render() {
    return (
      <div >
        <span style={{ position: 'relative', textAlign: 'center', display: 'block', fontSize: '20px' }}>Top 1000 Largest Keys By Perfix</span>
        <KeyCountTable value={this.props.value} />
      </div>

    );
  }
}

