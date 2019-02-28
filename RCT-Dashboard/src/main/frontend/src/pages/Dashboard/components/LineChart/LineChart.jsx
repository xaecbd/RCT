import React, { Component } from 'react';

import { Select, Feedback } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import CountRateLineChart from '../CountRateLineChart';
import MemoryRateLineChart from '../MemoryRateLineChart';
import axiosInstance from '../../../../axios';


const Toast = Feedback.toast;
export default class LineChart extends Component {
  static displayName = 'LineChart';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.queryCache = {};
    this.state = {
      pefixSelectData: [],
      value: {
        selectData: '',
        timeSelected: this.props.value.timeSelected,
        id: this.props.value.id,
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value }, () => {
      this.getSelectData();
    });
  }

  onSearchs = (value) => {
    const result = [];
    this.state.pefixSelectData.map((db) => {
      const reg = new RegExp(value);
      if (db.value.match(reg)) {
        const data = { value: db.value, label: db.label };
        result.push(data);
      }
    });
    this.setState({ pefixSelectData: result });
  }


  onPrefixSelect = (value) => {
    this.state.value.selectData = value;
    this.setState({
      value: this.state.value,
    });
    this.getSelectData();
  }

  getSelectData = () => {
    if (this.state.value.id && this.state.value.timeSelected) {
      axiosInstance
        .get(`/rdb/all/key_prefix?pid=${this.state.value.id}&scheduleId=${this.state.value.timeSelected}`)
        .then((response) => {
          if (response.data.code === 200 && response.data.data) {
            const keyData = { label: 'Top 20', value: 'Top' };
            const datas = [];
            datas.push(keyData);
            response.data.data.map((a) => {
              datas.push(a);
            });
            this.setState({ pefixSelectData: datas }, () => {

            });
          } else {
            Toast.error('Get Prefix Key Data Error!');
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  render() {
    return (
      <div>
        <IceContainer>
          <div style={styles.formItem}>
            <span style={{ minWidth: '70px' }}>Prefix Key:</span>&nbsp;&nbsp;
            <Select
              showSearch
              placeholder="Prefix Key"
              onSearch={e => this.onSearchs(e)}
              onChange={e => this.onPrefixSelect(e)}
              size="large"
              style={{ width: '200px' }}
            >
              {
                this.state.pefixSelectData.map((db) => {
                return <Select.Option value={db.value} key={db.value}>{db.label}</Select.Option>;
                 })
               }
            </Select>
          </div>
        </IceContainer>
        <IceContainer>
          <CountRateLineChart value={this.state.value} />
          <MemoryRateLineChart value={this.state.value} />
        </IceContainer>
      </div>

    );
  }
}
const styles = {
  formItem: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0',
    float: 'right',
  },
};
