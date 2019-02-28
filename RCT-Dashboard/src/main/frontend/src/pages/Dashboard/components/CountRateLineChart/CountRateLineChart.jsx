
import React, { Component } from 'react';
import axiosInstance from '../../../../axios';
import { moment } from '@icedesign/base';

const ReactHighcharts = require('react-highcharts');

const formatterInput = (value) => {
  return value.toString().replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,');
};
export default class CountRateLineRate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: sessionStorage.getItem('pid'),
      timeData: [],
      analyzeData: [],
      value: {},
    };
  }

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
            .get(`/rdb/line/prefix/PrefixKeyByCount?pid=${this.state.value.id}&prefixKey=${this.state.value.selectData}`)
            .then((response) => {
              if (response.data.code === 200 && response.data.data) {
                this.setState({ analyzeData: response.data.data }, () => {
                  this.sortSchedule(response.data.data);
                });
              }
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          axiosInstance
            .get(`/rdb/line/prefix/PrefixKeyByCount?pid=${this.state.value.id}`)
            .then((response) => {
              if (response.data.code === 200 && response.data.data) {
                this.setState({ analyzeData: response.data.data }, () => {
                  this.sortSchedule(response.data.data);
                });
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }
    }

    sortSchedule = (data) => {
      let dataSource = [];
      dataSource = data.sort((a, b) => {
        return b.key - a.key;
      });
      this.setState({
        analyzeData: dataSource,
      });
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
        xAxis: {
          title: {
            text: 'time',
          },
          categories: timeData,
        },
        tooltip: {
          formatter() {
            return [`<b>${this.x}</b>`].concat(
              this.points.map((point) => {
                return `${point.series.name}: ${formatterInput(point.y)}`;
              })
            );
          },
          split: true,
        },
        yAxis: [
          {
            title: {
              text: 'Count',
            },
            tickInterval: 300,
          },
        ],
        series: seriesData,
      };
    }

    render() {
      return (
        <div style={{ float: 'left', width: '50%' }}>
          <span style={{ position: 'relative', textAlign: 'center', display: 'block', fontSize: '20px', marginBottom: '20px' }}>Prefix Keys Count</span>
          <ReactHighcharts config={this.getOptionForLine(this.state.analyzeData)} />
        </div>
      );
    }
}
