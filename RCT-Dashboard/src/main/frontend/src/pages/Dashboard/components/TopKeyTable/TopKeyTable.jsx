import React, { Component } from 'react';
import { Tab } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import HashTopKey from './HashTopKey';
import ListTopKey from './ListTopKey';
import SetTopKey from './SetTopKey';
import StringTopKey from './StringTopKey';


export default class TopKeyTable extends Component {
  static displayName = 'TopKeyTable';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.queryCache = {};
    this.state = {
      value: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value }, () => {

    });
  }
  generateAnalyzeRet() {
    const panes = [{ tab: 'Hash', key: 0, content: <HashTopKey value={this.state.value} /> },
      { tab: 'List', key: 1, content: <ListTopKey value={this.state.value} /> },
      { tab: 'Set', key: 2, content: <SetTopKey value={this.state.value} /> },
      { tab: 'String', key: 3, content: <StringTopKey value={this.state.value} /> }];
    return (
      <div >
        <IceContainer>
          <span style={{ position: 'relative', textAlign: 'center', display: 'block', fontSize: '20px' }}>Top 1000 Largest Keys By Type</span>
          <p />
          <Tab>
            {
              panes.map(pane => (
                <Tab.TabPane tab={pane.tab} key={pane.key}>
                  {pane.content}
                </Tab.TabPane>
              ))
            }

          </Tab>
        </IceContainer>
      </div>
    );
  }


  render() {
    let analyzeRet = null;
    analyzeRet = this.generateAnalyzeRet();
    return (
      <div className="post-list-page">
        {analyzeRet}
      </div>

    );
  }
}

