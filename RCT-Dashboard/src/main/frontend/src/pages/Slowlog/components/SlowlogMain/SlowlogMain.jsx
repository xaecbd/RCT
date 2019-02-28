import React, { Component } from 'react';
import { Card } from '@icedesign/base';
import { withRouter } from 'react-router-dom';

@withRouter
class SlowlogMain extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  onSlowList = () => {
    this.props.history.push({ pathname: '/slowlog_list' });
  };
  onSlowlog = () => {
    this.props.history.push({ pathname: '/slowlog_statistic' });
  };

  onSlowEdit = () => {
    this.props.history.push({ pathname: '/slowlog_monitor' });
  };
  render() {
    return (
      <div>
        <Card
          key="1"
          bodyHeight="300px"
          style={{
            marginRight: '2%',
            height: '30%',
            width: '32%',
            textAlign: 'center',
            verticalAlign: 'middle',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            this.onSlowList(e);
          }}
        >
          <h1>Slowlog List </h1>
          <img src="../../../../../public/images/list.png" alt="" />
        </Card>

        <Card
          key="2"
          bodyHeight="300px"
          style={{
            marginRight: '2%',
            height: '30%',
            width: '32%',
            textAlign: 'center',
            verticalAlign: 'middle',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            this.onSlowlog(e);
          }}
        >
          <h1>Statistics</h1>
          <img src="../../../../../public/images/statistical.png" alt="" />
        </Card>
        <Card
          key="3"
          bodyHeight="300px"
          style={{
            height: '30%',
            width: '32%',
            textAlign: 'center',
            verticalAlign: 'middle',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            this.onSlowEdit(e);
          }}
        >
          <h1>Monitors</h1>
          <img src="../../../../../public/images/time.png" alt="" />
        </Card>
      </div>
    );
  }
}
export default SlowlogMain;
