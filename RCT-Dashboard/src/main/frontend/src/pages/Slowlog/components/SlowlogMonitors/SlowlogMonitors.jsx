import React, { Component } from 'react';
import IceContainer from '@icedesign/container';
import {
  Card,
  Switch,
  Input,
  Grid,
  Feedback,
  Balloon,
  Icon,
} from '@icedesign/base';
import axiosInstance from '../../../../axios';

import './SlowlogMonitors.scss';

const { Row, Col } = Grid;
const Toast = Feedback.toast;
export default class SlowlogMonitors extends Component {
  constructor(props) {
    super(props);
    const pid = sessionStorage.getItem('pid');
    this.state = {
      clusterSetting: [],
      disabled: true,
      pid,
      slowlog: {
        id: '',
        autoAnalyze: false,
        schedule: '',
        pid: '',
      },
      cronData: [],
      status: '',
    };
  }
  componentDidMount() {
    this.getRedisInfoData(this.state.pid);
    this.getSlowlogJob(this.state.pid);
  }

  getRedisInfoData = (pid) => {
    axiosInstance
      .get(`/redis/${pid}`)
      .then((res) => {
        if (res.data !== undefined) {
          this.setState({
            clusterSetting: res.data.data,
          });
        }
      })
      .catch((error) => {
        Feedback.toast.error('Fetch cluster Info failed!');
        console.log(error);
      });
  };
  onInputChange = (schedule) => {
    this.state.slowlog.schedule = schedule;
    if (schedule !== '') {
      this.setState({
        disabled: false,
        slowlog: this.state.slowlog,
      });
      this.getCronList(this.state.slowlog);
    } else {
      this.setState({
        disabled: true,
      });
    }
  };
  onSwitchChange = (checked) => {
    const data = this.state.slowlog;
    data.autoAnalyze = checked;
    data.pid = this.state.pid;
    if (data.id) {
      axiosInstance
        .put('/slowlog', this.state.slowlog)
        .then((res) => {
          Toast.success(res.data.message);
          this.getStatus(data.id);
          this.setState({
            slowlog: data,
          });
        })
        .catch((error) => {
          Toast.error('Analyze failed!');
          console.log(error);
        });
    } else {
      axiosInstance
        .post('/slowlog', this.state.slowlog)
        .then((res) => {
          Toast.success(res.data.message);
          const datas = this.state.slowlog;
          datas.id = res.data.data.id;
          this.setState({
            slowlog: datas,
          });
          this.getStatus(res.data.data.id);
        })
        .catch((error) => {
          Toast.error('Analyze failed!');
          console.log(error);
        });
    }
  };

  getCronList(values) {
    axiosInstance
      .post('/test_corn', values)
      .then((response) => {
        this.setState({ cronData: response.data.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }
  getStatus(value) {
    axiosInstance
      .get(`/slowlog/monitor/status/${value}`)
      .then((response) => {
        this.setState({ status: response.data.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }
  getSlowlogJob(value) {
    axiosInstance
      .get(`/slowlog/pid/${value}`)
      .then((response) => {
        if (response.data.code === 200 && response.data.data) {
          const data = this.state.slowlog;
          data.schedule = response.data.data.schedule;
          data.autoAnalyze = response.data.data.autoAnalyze;
          data.id = response.data.data.id;
          if (response.data.data.schedule) {
            this.setState({
              disabled: false,
            });
          }
          this.getStatus(response.data.data.id);
          this.setState({
            slowlog: data,
          });
        } else {
          this.setState({
            status: 'NONE',
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    const clickTrigger = (
      <Icon
        type="prompt"
        style={{ margin: '6px', lineHeight: '1.7rem', marginTop: '2px' }}
      />
    );
    return (
      <IceContainer>
        <Card
          key="1"
          bodyHeight="300px"
          title={<span style={styles.font}>Monitors</span>}
          style={{
            marginRight: '5px',
            height: '40%',
            width: '40%',
            verticalAlign: 'middle',
          }}
        >
          <Row style={styles.formRow}>
            <Col xxs="8" s="7" l="6" style={styles.formLabel}>
              Address:
            </Col>
            <Col xxs="8" s="7" l="6" style={styles.formLabel}>
              <span>{this.state.clusterSetting.address}</span>
              <br />
              <br />
            </Col>
          </Row>
          <Row style={styles.formRow}>
            <Col xxs="8" s="7" l="6" style={styles.formLabel}>
              Schedule:
            </Col>
            <Col xxs="8" s="7" l="6" style={styles.formLabel}>
              <Input
                placeholder="0 0 0 1/1 * ? "
                value={this.state.slowlog.schedule}
                onChange={(value) => {
                  this.onInputChange(value);
                }}
              />
              <br />
              <br />
            </Col>
            <Col />
            <Col>
              <Balloon
                trigger={clickTrigger}
                triggerType="hover"
                onVisibleChange={(e) => {
                  this.getCronList(this.state.slowlog);
                }}
              >
                <ul>
                  {this.state.cronData.map((db) => {
                    return <li>{db}</li>;
                  })}
                </ul>
              </Balloon>
            </Col>
          </Row>
          <Row style={styles.formRow}>
            <Col xxs="8" s="7" l="6" style={styles.formLabel}>
              <span>Status:</span>
            </Col>
            <Col xxs="16" s="15" l="14" style={styles.formLabel}>
              <span>{this.state.status}</span>
            </Col>
          </Row>
          <Row style={styles.formRow}>
            <Col xxs="8" s="7" l="6" style={styles.formLabel} />
            <Col xxs="8" s="7" l="6" style={styles.formLabel} />

            <Col xxs="8" s="7" l="6" style={styles.formLabel} />

            <Col xxs="8" s="7" l="6" style={styles.formLabel}>
              <Switch
                checkedChildren="on"
                unCheckedChildren="off"
                checked={this.state.slowlog.autoAnalyze}
                style={styles.switchStyle}
                disabled={this.state.disabled}
                onChange={(checked) => {
                  this.onSwitchChange(checked);
                }}
              />
            </Col>
          </Row>
        </Card>
      </IceContainer>
    );
  }
}

const styles = {
  title: {
    marginLeft: '10px',
    lineHeight: '20px',
  },
  formRow: {
    marginBottom: '3px',
  },
  formLabel: {
    textAlign: 'left',
    lineHeight: '1.5rem',
    paddingRight: '10px',
  },
  font: {
    fontWeight: 'bold',
  },
  switchStyle: {
    width: '66px',
  },
};
