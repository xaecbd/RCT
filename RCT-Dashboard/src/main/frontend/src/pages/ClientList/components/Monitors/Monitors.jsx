import React, { Component } from 'react';
import {
  Feedback,
  Select,
  Grid,
  Input,
  Card,
  Icon,
  Dialog,
} from '@icedesign/base';
import axiosInstance from '../../../../axios';
import IceContainer from '@icedesign/container';

const { Row, Col } = Grid;

const Toast = Feedback.toast;
export default class Monitors extends Component {
  constructor(props) {
    super(props);

    this.state = {
      exeVis: false,
      canVis: false,
      jobstatus: {
        Interval: '',
        timer: '',
        timerUtil: '',
        timeUtils: '',
        interval: '',
        execute: false,
        status: 'NO JOB',
        id: sessionStorage.getItem('pid'),
      },
    };
  }

  componentWillMount() {
    this.checkJob();
  }
  selectMapping = (value) => {
    const values = parseInt(value, 10);
    if (values === 30) {
      return '30 Seconds';
    }
    const a = values / 60;
    return `${a} minutes`;
  };


  selectTimerUtil = (value) => {
    const values = parseInt(value, 10);
    if (values / 3600 === 1) {
      return 'hours';
    } else if (values / 60 === 1) {
      return 'minutes';
    } else if (values / 86400 === 1) {
      return 'days';
    }
  }

  checkJob = () => {
    axiosInstance
      .post(
        `/client_list/monitor/check_job?id=${sessionStorage.getItem('pid')}`
      )
      .then((res) => {
        if (res.data.code === 200) {
          if (res.data.data.status === 'ISRUNNING') {
            this.state.jobstatus.Interval = this.selectMapping(
              res.data.data.data.internal
            );
            this.state.jobstatus.interval = res.data.data.data.internal;
            this.state.jobstatus.timer = res.data.data.data.timer;
            this.state.jobstatus.timerUtil = this.selectTimerUtil(res.data.data.data.timerUtil);
            this.state.jobstatus.timeUtils = res.data.data.data.timerUtil;
            this.state.jobstatus.status = res.data.data.status;
            this.setState({
              jobstatus: this.state.jobstatus,
            });
          }
        } else {
          Toast.error('Add Job Faild!');
        }
      })
      .catch((error) => {
        Toast.error('Job Faild!');
        console.log(error);
      });
  };

  onSwitchChange = (e) => {
    const data = this.state.jobstatus;
    data.Interval = data.interval;
    data.timerUtil = data.timeUtils;
    if (this.state.jobstatus.Interval && this.state.jobstatus.timer && this.state.jobstatus.timerUtil) {
      if (this.state.jobstatus.status === 'RUNNING') {
        Toast.success('Job Always RUNNING!');
        return;
      }
      this.state.jobstatus.status = 'RUNNING';
      this.setState({
        jobstatus: this.state.jobstatus,
      });
      this.fectchData(data);
    } else {
      Toast.error('please input interval and endTime');
    }
  };

  fectchData = (data) => {
    // 后台读取任务状态,完成放开disabled
    axiosInstance
      .post('/client_list/monitor/excute/', data)
      .then((res) => {
        if (res.data.code === 200) {
          this.setState({
            exeVis: false,
          });
          if (res.data.status === 'ISRUNNING') {
            this.state.jobstatus.status = res.data.status;
            this.setState({
              jobstatus: this.state.jobstatus,
            });
            Toast.error('Job Always RUNNING!');
          } else if (res.data.status === 'DONE') {
            this.state.jobstatus.status = 'DONE';
            this.setState({
              jobstatus: this.state.jobstatus,
            });
          } else {
            Toast.success(res.data.data.msg);
          }
        } else {
          Toast.error('Add Job Faild!');
        }
      })
      .catch((error) => {
        Toast.error('Job Faild!');
        console.log(error);
      });
  };

  cancelJob = () => {
    axiosInstance
      .post('/client_list/monitor/cancel/', this.state.jobstatus)
      .then((res) => {
        if (res.data.code === 200) {
          this.state.jobstatus.status = res.data.data.status;
          this.setState({
            jobstatus: this.state.jobstatus,
          });
          if (res.data.data.status === 'NOTRUNNING') {
            Toast.success('NO JobRunning!');
            return;
          }
          if (res.data.data.status === 'CANCELED') {
            Toast.success('Job Canceled Success!');
          }
        } else {
          Toast.error('Cancel Job Faild!');
        }
      })
      .catch((error) => {
        Toast.error('Cancel Job Faild!');
        console.log(error);
      });
  };
  onInterval = (_value) => {
    this.state.jobstatus.Interval = _value;
    this.state.jobstatus.interval = _value;
    this.setState({
      jobstatus: this.state.jobstatus,
    });
  };

  onButtonClick = (e) => {
    // 后台取消任务
    this.cancelJob();
  };
  onEndChange = (_data, _formdata) => {
    this.state.jobstatus.endTime = _formdata;
    this.setState({
      jobstatus: this.state.jobstatus,
    });
  };
  onExecuteClose = () => {
    this.setState({
      exeVis: false,
    });
  };

  ExeSumbit = () => {
    this.onSwitchChange();
  };

  openExeConfrim = () => {
    this.setState({
      exeVis: true,
    });
  };

  openCanConfrim = () => {
    this.setState({
      canVis: true,
    });
  };

  canSumbit = () => {
    this.cancelJob();
    this.setState({
      canVis: false,
    });
  };

  onCanClose = () => {
    this.setState({
      canVis: false,
    });
  };

  onTimer = (value) => {
    const data = this.state.jobstatus;
    data.timer = value;
    this.setState({
      jobstatus: data,
    });
  };

  onTimerUnit = (value) => {
    const data = this.state.jobstatus;
    data.timerUtil = value;
    data.timeUtils = value;
    this.setState({
      jobstatus: data,
    });
  };

  render() {
    return (
      <IceContainer>
        <Card
          key="1"
          title={
            <font
              style={{
                fontSize: '16px',
                fontWeight: '500',
                color: 'rgba(0,0,0,.85)',
              }}
            >
              Monitors
            </font>
          }
          bodyHeight="1000px"
          style={{
            marginRight: '5px',
            height: '40%',
            width: '40%',
            verticalAlign: 'middle',
          }}
        >
          <div style={styles.body}>
            <Row style={styles.formRow}>
              <Col xxs="8" s="7" l="6" style={styles.formLabel}>
                <span>Interval:</span>
              </Col>
              <Col xxs="16" s="15" l="14" style={styles.formLabel}>
                <Select
                  placeholder="Interval"
                  value={this.state.jobstatus.Interval}
                  style={{ width: '100%', height: '100%' }}
                  onChange={(value) => {
                    this.onInterval(value);
                  }}
                >
                  <Select.Option value="30">30 Seconds</Select.Option>
                  <Select.Option value="60">1 minutes</Select.Option>
                  <Select.Option value="120">2 minutes</Select.Option>
                  <Select.Option value="180">3 minutes</Select.Option>
                </Select>
              </Col>
            </Row>
            <p />
            <Row style={styles.formRow}>
              <Col xxs="8" s="7" l="6" style={styles.formLabel}>
                <span>Exetime:</span>
              </Col>
              <Col xxs="16" s="15" l="14" style={styles.formLabels}>
                <Input
                  value={this.state.jobstatus.timer}
                  style={{ width: '50%', height: '100%' }}
                  onChange={(value) => {
                    this.onTimer(value);
                  }}
                />
                <Select
                  value={this.state.jobstatus.timerUtil}
                  style={{ width: '50%', height: '100%' }}
                  onChange={(value) => {
                    this.onTimerUnit(value);
                  }}
                >
                  <Select.Option value="86400">days</Select.Option>
                  <Select.Option value="60">minutes </Select.Option>
                  <Select.Option value="3600">hours</Select.Option>
                </Select>
              </Col>
            </Row>
            <Row style={styles.formRow}>
              <Col xxs="8" s="7" l="6" style={styles.formLabel}>
                <span>Status:</span>
              </Col>
              <Col xxs="16" s="15" l="14" style={styles.formLabel}>
                <span>{this.state.jobstatus.status}</span>
              </Col>
            </Row>
          </div>
          <div style={styles.footer}>
            <a
              onClick={(e) => {
                this.openExeConfrim();
              }}
              style={{ ...styles.link, ...styles.line }}
            >
              <Icon type="select" size="small" style={styles.icon} /> Execute
            </a>
            <a
              onClick={(e) => {
                this.openCanConfrim();
              }}
              style={styles.link}
            >
              <Icon type="skip" size="small" style={styles.icon} />
              Cancel
            </a>
          </div>
        </Card>
        <Dialog
          visible={this.state.exeVis}
          onOk={this.ExeSumbit}
          closable="esc,mask,close"
          onCancel={this.onExecuteClose}
          onClose={this.onExecuteClose}
          title="Execute"
        >
          Are you sure to Execute A Job Write Data to EleasticSearch?
        </Dialog>
        <Dialog
          visible={this.state.canVis}
          onOk={this.canSumbit}
          closable="esc,mask,close"
          onCancel={this.onCanClose}
          onClose={this.onCanClose}
          title="Delete"
        >
          Are you sure to Cancel This Running Job?
        </Dialog>
      </IceContainer>
    );
  }
}

const styles = {
  formLabel: {
    textAlign: 'left',
    lineHeight: '2.1rem',
    paddingRight: '10px',
  },
  formLabels: {
    textAlign: 'left',
    lineHeight: '2.1rem',
    paddingRight: '10px',
    display: 'flex',
  },
  formRow: {
    marginBottom: '3px',
  },
  line: {
    borderRight: '1px solid #f0f0f0',
  },
  icon: {
    marginRight: '5px',
  },
  link: {
    height: '56px',
    lineHeight: '56px',
    color: '#a84ef9',
    cursor: 'pointer',
    textDecoration: 'none',
    width: '50%',
    textAlign: 'center',
  },
  footer: {
    display: 'flex',
    alignItems: 'left',
    justifyContent: 'space-around',
  },
  body: {
    padding: '20px',
    height: '150px',
    position: 'relative',
    borderBottom: '1px solid #f0f0f0',
  },
};
