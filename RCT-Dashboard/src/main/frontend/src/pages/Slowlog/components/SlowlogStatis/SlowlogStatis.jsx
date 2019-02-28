import React, { Component } from 'react';
import IceContainer from '@icedesign/container';
import { Loading } from '@icedesign/base';
import axiosInstance from '../../../../axios';
import './SlowlogStatis.scss';

const ReactHighcharts = require('react-highcharts');
const Highcharts = require('highcharts');

export default class Echartes extends Component {
  static displayName = 'Echartes';
  constructor(props) {
    super(props);
    const pid = sessionStorage.getItem('pid');
    this.state = {
      loadingVisible: false,
      analyzeData: {},
      pid,
    };
  }
  componentDidMount() {
    this.handleLoading();
    axiosInstance
      .get(`/slowlog/statistics/${this.state.pid}`)
      .then((response) => {
        this.setState(
          { analyzeData: JSON.parse(response.data.data).commondsStatisticsObj },
          () => {
            this.handleLoading();
          }
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleLoading = () => {
    this.setState({
      loadingVisible: !this.state.loadingVisible,
    });
  };

  generateAnalyzeRet() {
    const analyzeData = this.state.analyzeData;
    if (!analyzeData) {
      return null;
    }
    return (
      <div style={styles.container}>
        <IceContainer>
          <ReactHighcharts config={this.getOptionForPie(analyzeData)} />
        </IceContainer>
      </div>
    );
  }

  getOptionForPie = (data, scroll = false) => {
    const legendData = [];
    const seriesData = [];
    const selected = {};
    Object.keys(data).forEach((key, index) => {
      legendData.push(key);
      seriesData.push({
        name: key,
        y: data[key],
      });
      selected[key] = index < 6;
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
        text: 'Commands Statistics',
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color:
                (Highcharts.theme && Highcharts.theme.contrastTextColor) ||
                'black',
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
  };

  render() {
    // 分析结果
    let analyzeRet = null;
    analyzeRet = this.generateAnalyzeRet();
    return (
      <div className="post-list-page">
        <Loading
          visible={this.state.loadingVisible}
          shape="dot-circle"
          style={styles.container}
        >
          {analyzeRet}
        </Loading>
      </div>
    );
  }
}

const styles = {
  container: {
    width: '100%',
  },
};
