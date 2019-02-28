import React, { Component } from 'react';
import axiosInstance from '../../../../axios';
import { Feedback, moment } from '@icedesign/base';

const ReactHighcharts = require('react-highcharts');


const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    let k = 1024, // or 1000
      sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
  
    return `${(bytes / Math.pow(k, i)).toFixed(1)  } ${  sizes[i]}`;
  };
export default class MemoryRateLineRate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: sessionStorage.getItem('pid'),
      timeData: [],
      analyzeData: [],
      value: {},
    };
  }

  // 接受父组件的变化的state值
  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value }, () => {
      this.getPieData();
    });
  }

  componentWillMount() {
    this.getTimeData();
  }

  getTimeData = () => {
    axiosInstance
      .get(`/rdb/all/schedule_id?pid=${this.state.id}`)
      .then((response) => {
        if (response.data.code === 200 && response.data.data.length > 0) {
          this.setState({
            timeData: response.data.data,
          }, () => {

          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

    getPieData = () => {
      if (this.state.value.id) {
        if (this.state.value.selectData && this.state.value.selectData !== 'Top') {
          axiosInstance
            .get(`/rdb/line/prefix/PrefixKeyByMemory?pid=${this.state.value.id}&prefixKey=${this.state.value.selectData}`)
            .then((response) => {
              if (response.data.code === 200 && response.data.data) {
                this.setState({ analyzeData: response.data.data }, () => {

                });
              }
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          axiosInstance
            .get(`/rdb/line/prefix/PrefixKeyByMemory?pid=${this.state.value.id}`)
            .then((response) => {
              if (response.data.code === 200 && response.data.data) {
                this.setState({ analyzeData: response.data.data }, () => {

                });
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }
    }
    getOptionForLine = (data) => {
      const seriesData = [];
      const timeData = [];
      data.map((db) => {
        const prefix = db.key;
        const count = db.value;
        const counts = [];
        count.split(',').map((a) => {
          counts.push(parseInt(a, 10));
        });
        seriesData.push({
          name: prefix,
          type: 'line',
          pointStart: 0,
          data: counts,
        });
      });
      if (this.state.timeData) {
        this.state.timeData.map((value) => {
          timeData.push(moment(parseInt(value.value, 10)).format('YYYY-MM-DD HH:mm:ss'));
        });
      }
      return {
        credits: {
          enabled: false,
        },
        chart: {
          type: 'line',
        },
        title: {
          text: '',
        },
        tooltip: {      
          formatter() {           
            return [`<b>${this.x}</b>`].concat(
              this.points.map((point) => {
                return `${point.series.name  }: ${formatBytes(point.y)}`;
              })
            );
          },
          split: true,
        },
        xAxis: {
          title: {
            text: 'time',
          },
          categories: timeData,
        },
        yAxis: [
          {
            title: {
              text: 'Bytes',
            },
            tickInterval: 300,
            labels: {
              formatter() {
                return formatBytes(this.value);
              },
            },
          },

        ],
        series: seriesData,
      };
    }
    render() {
      return (
        <div style={{ float: 'left', width: '50%' }}>
          <span style={{ position: 'relative', textAlign: 'center', display: 'block', fontSize: '20px', marginBottom: '20px' }}>Prefix Keys Memory</span>
          <p /> <p />
          <ReactHighcharts config={this.getOptionForLine(this.state.analyzeData)} />
        </div>
      );
    }
}

