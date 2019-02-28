import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Card } from '@icedesign/base';

@withRouter
export default class ClientMain extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clientListVisable: false,
      chartVisable: false,
      jobVisable: false,
      disabled: false,
      jobstatus: {
        Interval: '',
        endTime: null,
        execute: false,
        status: 'NO JOB',
        id: this.props.info,
      },
    };
  }

  onChartClose = () => {
    this.setState({
      chartVisable: false,
    });
  }
  onChartClick = () => {
    this.setState({
      chartVisable: true,
    });
  }
  onClick = () => {
    this.setState({
      clientListVisable: true,
    });
  }


  onClose = () => {
    this.setState({
      clientListVisable: false,
      chartVisable: false,
    });
  }

  onClickJob = () => {
    this.setState({
      jobVisable: true,
    });
  }

  render() {
    if (this.state.clientListVisable) {
      this.props.history.push({ pathname: '/client_list' });
    }

    if (this.state.chartVisable) {
      this.props.history.push({ pathname: '/client_statistics' });
    }

    if (this.state.jobVisable) {
      this.props.history.push({ pathname: '/client_monitors' });
    }

    return (

      <div>
        <Card
          key="1"
          bodyHeight="300px"
          style={{ marginRight: '2%', height: '30%', width: '32%', textAlign: 'center', verticalAlign: 'middle', cursor: 'pointer' }}
          onClick={(e) => { this.onClick(e); }}
        >
          <h1>Client List</h1>
          <img
            src="../../../../../public/images/client.png"
            alt=""

          />
        </Card>
        <Card
          key="2"
          bodyHeight="300px"
          style={{ marginRight: '2%', height: '30%', width: '32%', textAlign: 'center', verticalAlign: 'middle', cursor: 'pointer' }}
          onClick={(e) => { this.onChartClick(e); }}
        >
          <h1>Statistics</h1>
          <img
            src="../../../../../public/images/chart.png"
            alt=""
          />
        </Card>
        <Card
          key="3"
          bodyHeight="300px"
          style={{ height: '30%', width: '32%', textAlign: 'center', verticalAlign: 'middle', cursor: 'pointer' }}
          onClick={(e) => { this.onClickJob(e); }}
        >
          <h1>Monitors</h1>
          <img
            src="../../../../../public/images/time.png"
            alt=""
          />

        </Card>
      </div>
    );
  }
}

