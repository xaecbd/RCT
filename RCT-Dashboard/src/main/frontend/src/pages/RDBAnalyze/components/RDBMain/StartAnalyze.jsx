import React, { Component } from 'react';
import { Button, Balloon } from '@icedesign/base';


export default class StartAnalyze extends Component {
  constructor(props) {
    super(props);
    this.handleHide = this.handleHide.bind(this);
    this.state = {
      visible: false,
    };
  }

  handleHide = (visible, code) => {
    if (code === 1) {
      // 调用分析接口
      this.props.handleExec(this.props.pid);    
      if (this.props.status) {      
      }
    }
    this.setState({
      visible: false,
    });
  };

  handleVisible = (visible) => {
    this.setState({ visible });
  };

  render() {
    const visibleTrigger = (
      <Button type="secondary" disabled={this.props.status}>
        Analyze
      </Button>
    );

    const content = (
      <div>
        <div style={styles.contentText}>Confirm execute？</div>
        <Button
          id="confirmBtn"
          size="small"
          type="normal"
          shape="warning"
          style={{ marginRight: '5px' }}
          disabled={this.props.status}
          onClick={visible => this.handleHide(visible, 1)}
        >
          Yes
        </Button>
        <Button
          id="cancelBtn"
          size="small"
          onClick={visible => this.handleHide(visible, 0)}
        >
          Cancel
        </Button>
      </div>
    );

    return (
      <Balloon
        trigger={visibleTrigger}
        triggerType="click"
        visible={this.state.visible}
        onVisibleChange={this.handleVisible}
      >
        {content}
      </Balloon>
    );
  }
}

const styles = {
  contentText: {
    padding: '5px 0 15px',
  },
};
