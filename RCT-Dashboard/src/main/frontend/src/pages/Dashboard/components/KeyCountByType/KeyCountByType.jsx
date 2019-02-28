import React, { Component } from 'react';
import axiosInstance from '../../../../axios';
import { Feedback } from '@icedesign/base';

const ReactHighcharts = require('react-highcharts');
const Highcharts = require('highcharts');

const formatterInput = (value) => {
  return value.toString().replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,');
};


const Toast = Feedback.toast;
export default class KeyCountByType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      analyzeData: '',
      value: {},
    };
  }


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
                Toast.error('Get Key Count By Type Data Error!');
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
             y: parseInt(data[key].itemCount, 10),

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
         credits: {
           enabled: false,
         },
         title: {
           text: '',
         },
         tooltip: {
           //    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b><br/>count:<b>{point.y}</b>',
           shadow: true, // 是否显示阴影
           animation: true, // 是否启用动画效果
           formatter() { // 自定义提示
             return ` ${this.series.name}:<b>${Highcharts.numberFormat(this.point.percentage, 2)}%</b><br/>Count:${formatterInput(this.point.y)}`;
           },
         },
         plotOptions: {
           pie: {
             allowPointSelect: true,
             cursor: 'pointer',
             colors: ['#18BFA6','#84BF18'],
             dataLabels: {
               enabled: true,
               format: '<b>{point.name}</b>: {point.percentage:.1f} %',
               //    style: {
               //      color:
               //             Highcharts.theme,
               //    },
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
        <span style={{ position: 'relative', textAlign: 'center', display: 'block', fontSize: '20px', marginBottom: '20px' }}>Key Count By Type</span>
        {analyzeRet}
      </div>
    );
  }
}

