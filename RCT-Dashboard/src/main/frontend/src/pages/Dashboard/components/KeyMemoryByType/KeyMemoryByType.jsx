import React, { Component } from 'react';
import axiosInstance from '../../../../axios';
import { Feedback } from '@icedesign/base';

const ReactHighcharts = require('react-highcharts');
const Highcharts = require('highcharts');

const Toast = Feedback.toast;

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  let k = 1024, // or 1000
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)  } ${  sizes[i]}`;
};

export default class KeyCountByType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: sessionStorage.getItem('pid'),
      analyzeData: [],
      config: '',
      value: {},
    };
    //   this.getPieData();
  }
  handleChange = (value) => {
    const { config } = this.state;
    config.series[0].data[0].y = random(20, 40);
    this.setState({
      selectedValue: value,
      config,
    });
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value }, () => {
      this.getPieData();
    });
  }

      getPieData = () => {
        if (this.state.value.id && this.state.value.timeSelected) {
          axiosInstance
            .get(`/rdb/chart/DataTypeAnalyze?pid=${this.state.value.id}&scheduleId=${this.state.value.timeSelected}`)
            .then((response) => {
              if (response.data.code === 200 && response.data.data) {
                this.setState({ analyzeData: response.data.data }, () => {
                });
              } else {
                Toast.error(' Get Key Memory By Type Data Error!');
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }
     getOptionForPie = (data) => {
       const legendData = [];
       const seriesData = [];
       Object.keys(data)
         .forEach((key, index) => {
           legendData.push(key);
           seriesData.push({
             name: data[key].dataType,
             y: parseInt(data[key].bytes, 10),
           });
         });

       return {
         chart: {
           height: 300,
           plotBackgroundColor: null,
           plotBorderWidth: null,
           plotShadow: false,
           type: 'pie',
         },
         title: {
           text: '',
         },
         credits: {
           enabled: false,
         },
         tooltip: {
           //    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>count:<b>{point.y}</b>',
           shadow: true, // 是否显示阴影
           animation: true, // 是否启用动画效果
           formatter() { // 自定义提示
             return ` ${this.series.name}:<b>${Highcharts.numberFormat(this.point.percentage, 2)}%</b><br/>Memory:${formatBytes(this.point.y)}`;
           },
         },
         plotOptions: {
           pie: {
             allowPointSelect: true,
             cursor: 'pointer',
             colors: ['#18BFA6', '#84BF18'],
             dataLabels: {
               enabled: true,
               format: '<b>{point.name}</b>: {point.percentage:.1f} %',
               style: {
                 color:
                        (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
               },
             },
           },
         },
         series: [
           {
             colorByPoint: true,
             data: seriesData,
           },
         ],
       };
     }

    onChartLegendselectchanged = (_param, _echart) => {

    };

  onChartReady = (_echarts) => {

  };
  generateAnalyzeRet() {
    const analyzeData = this.state.analyzeData;

    if (!analyzeData) {
      return null;
    }
    return (

      <ReactHighcharts config={this.getOptionForPie(analyzeData)} />
    );
  }
  render() {
    let analyzeRet = null;
    analyzeRet = this.generateAnalyzeRet();
    return (
      <div style={{ float: 'left', width: '50%' }}>
        <span style={{ position: 'relative', textAlign: 'center', display: 'block', fontSize: '20px', marginBottom: '20px' }}>Key Memory By Type</span>
        {analyzeRet}
      </div>
    );
  }
}
