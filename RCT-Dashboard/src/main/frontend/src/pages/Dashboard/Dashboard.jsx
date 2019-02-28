import React, { Component } from 'react';
import IceContainer from '@icedesign/container';
import KeyCountByType from './components/KeyCountByType';
import KeyMemoryByType from './components/KeyMemoryByType';
import PrefixKeyTable from './components/PrefixKeyTable';
import { Select, moment } from '@icedesign/base';
import TopKeyTable from './components/TopKeyTable';
import PrefixTTLTable from './components/PrefixTTLTable';
import axiosInstance from '../../axios';
import LineChart from './components/LineChart';

import { Feedback } from '@icedesign/base';

const Toast = Feedback.toast;

export default class Dashboard extends Component {
  static displayName = 'Dashboard';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    const pid = sessionStorage.getItem('pid');
    this.state = {
      pefixSelectData: [],
      pid,
      values: {
        id: pid,
        timeSelected: '',
      },
    };
  }

  componentWillMount() {
    this.getTimeData();
  }

  parseTime = (value) => {
    return moment(parseInt(value, 10)).format('YYYY-MM-DD HH:mm:ss');
  }

  onTimeSelect = (value) => {
    this.state.values.timeSelected = value;
    this.setState({
      values: this.state.values,
    });
  }
  getTimeData = () => {
    if (this.state.pid) {
      axiosInstance
        .get(`/rdb/all/schedule_id?pid=${this.state.pid}`)
        .then((response) => {
          if (response.data.code === 200 && response.data.data.length > 0) {
            let dataSource = [];
            dataSource = response.data.data.sort((a, b) => {
              return parseInt(b.value, 10) - parseInt(a.value, 10);
            });

            this.setState({ pefixSelectData: dataSource }, () => {
              this.state.values.timeSelected = this.getMaxTime(response.data.data);
              this.setState({
                values: this.state.values,
              });
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  getMaxTime = (data) => {
    let max = parseInt(data[0].value, 10);
    for (let i = 0; i < data.length; i++) {
      if (max < parseInt(data[i].value, 10)) {
        max = data[i].value;
      }
    }
    return max;
  }

  render() {
    return (
      <div>
        <IceContainer>
          <div style={styles.formItem}>
            <span style={{ minWidth: '70px' }}>Time:</span>&nbsp;&nbsp;
            <Select
              showSearch
              placeholder="Time"
              onChange={e => this.onTimeSelect(e)}
              size="large"
              value={this.state.values.timeSelected}
              style={{ width: '200px' }}
            >
              {
                this.state.pefixSelectData.map((db) => {
                return <Select.Option value={db.value} key={db.value}>{this.parseTime(db.label)}</Select.Option>;
                 })
               }
            </Select>
          </div>
        </IceContainer>


        <IceContainer>
          <KeyCountByType value={this.state.values} />
          <KeyMemoryByType value={this.state.values} />
        </IceContainer>



        <IceContainer >
          <LineChart value={this.state.values} />
        </IceContainer>
        <IceContainer style={{ float: 'left', width: '50%', marginRight: '1%' }}>
          <PrefixKeyTable value={this.state.values} />
        </IceContainer>
        <IceContainer style={{ float: 'rigth', width: '49%' }}>
          <PrefixTTLTable value={this.state.values} />
        </IceContainer>
        <IceContainer>
          <TopKeyTable value={this.state.values} />
        </IceContainer>
      </div>


    );
  }
}
const styles = {
  cardHead: {
    float: 'right',
  },
  cardTitle: {
    margin: '0',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  formItem: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0',
    float: 'right',
  },
};

