import React, { Component } from 'react';
import IceContainer from '@icedesign/container';
import { Table, Feedback, Button, Progress } from '@icedesign/base';
import axiosInstance from '../../../../axios';

const Toast = Feedback.toast;

const styles = {
  running: {
    color: '#5485F7',
  },
  canceled: {
    color: '#999999',
  },
  error: {
    color: '#ff0000',
  },
  done: {
    color: '#8000ff',
  },
  notInit: {
    color: '#FA7070',
  },
  not_start: {
    color: '#FA7070',
  },
  checking: {
    color: '#FA7070',
  },
  ready: {
    color: '#0000a0',
  },
};

const statusComponents = {
  NOT_START: <span style={styles.not_start}>not start</span>,
  RUNNING: <span style={styles.running}>running</span>,
  DONE: <span style={styles.done}>done</span>,
  CANCELED: <span style={styles.canceled}>canceled</span>,
  ERROR: <span style={styles.error}>error</span>,
  NOTINIT: <span style={styles.notInit}>notInit</span>,
  CHECKING: <span style={styles.checking}>checking</span>,
  READY: <span style={styles.ready}>ready</span>,
};

export default class RDBNodeList extends Component {
  static displayName = 'RDBNodeList';
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    const pid = sessionStorage.getItem('pid');
    this.state = {
      dataSource: [],
      disabled: false,
      pid,
    };
    this.closeProgress = this.closeProgress.bind(this);
    this.generatorData(pid);
  }
  componentDidMount() {
    this.timer = setInterval(() => { this.generatorData(this.state.pid); }, 3000);
  }
  componentWillUnmount() {
    if (this.timer !== null) { clearInterval(this.timer); }
  }
  closeProgress() {
    this.props.closeProgress();
  }
  getTimerData() {
    if (this.state.dataSource.length > 0) {
      this.componentDidMount();
    }
  }
  generatorData(redisInfoID) {
    axiosInstance
      .get(`/rdb/schedule_detail/${redisInfoID}`)
      .then((res) => {
        if (res.data.code === 200) {
          if (res.data.data) {
            const datas = res.data.data;
            let count = 0;
            for (let i = 0; i < datas.length; i += 1) {
              if (datas[i].status === 'DONE') {
                count += 1;
              }
              if (datas[i].status === 'CANCELED') {
                datas[i].process = 0;
                this.setState({ disabled: true });
              }
            }
            this.setState({ dataSource: datas }, () => {
              this.getTimerData();
            });
            if (count === datas.length) {
              this.setState({ disabled: true });
              this.componentWillUnmount();
            }
          }
        } else {
          Toast.error(res.data.message);
        }
      }).catch((error) => {
        Toast.error('Fetch progress list failed!');
        this.componentWillUnmount();
        console.log(error);
      });
  }

  renderStatus = (value) => {
    return statusComponents[value];
  };

  cancelInstance() {
    axiosInstance
      .get(`/rdb/cance_job/${this.state.pid}`)
      .then((res) => {
        if (res.data.code === 200) {
          if (res.data.data.canceled) {
            Toast.success('cancel progress success!');
            // refresh data
            this.generatorData(this.state.pid);
          } else {
            Toast.error('cancel progress failed!');
          }
        } else {
          Toast.error(res.data.message);
        }
      }).catch((error) => {
        Toast.error('cancel progress failed!');
        console.log(error);
      });
  }

  renderProcess =(value) => {
    return (<Progress percent={value} />);
  }
  onSort(value, order) {
    let dataSource = [];
    if ((typeof value) !== 'number') {
      dataSource = this.state.dataSource.sort((a, b) => {
        if (order === 'asc') {
          return a[value].localeCompare(b[value]);
        }
        return b[value].localeCompare(a[value]);
      });
    } else {
      dataSource = this.state.dataSource.sort((a, b) => {
        if (order === 'asc') {
          return a[value] - b[value];
        }
        return b[value] - a[value];
      });
    }
    this.setState({ dataSource });
  }
  render() {
    this.componentWillUnmount();
    return (
      <div>
        <IceContainer >
          <Button type="primary" onClick={() => this.cancelInstance()} disabled={this.state.disabled} style={{ float: 'right' }}>
          Cancel
          </Button>
        </IceContainer>
        <IceContainer>
          <Table dataSource={this.state.dataSource} hasBorder={false} onSort={(value, order) => this.onSort(value, order)} >
            <Table.Column title="Redis instance" width={80} sortable dataIndex="instance" />
            <Table.Column
              title="Status"
              style={{ textAlign: 'center' }}
              dataIndex="status"
              cell={this.renderStatus}
              width={100}
            />
            <Table.Column title="Process" style={{ textAlign: 'center' }} cell={this.renderProcess} width={100} dataIndex="process" />
          </Table>
        </IceContainer>
      </div>
    );
  }
}

