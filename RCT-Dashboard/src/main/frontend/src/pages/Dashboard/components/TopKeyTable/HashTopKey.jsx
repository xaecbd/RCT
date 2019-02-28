import React, { Component } from 'react';
import { Table, Pagination, Feedback } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import axiosInstance from '../../../../axios';
import '../PrefixTTL.scss';

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    let k = 1024, // or 1000
      sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
  
    return `${(bytes / Math.pow(k, i)).toFixed(1)  } ${  sizes[i]}`;
  };
const formatterInput = (value) => {
    return value.toString().replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,');
  };
const Toast = Feedback.toast;
const renderTime = (text) => {
  return <div title={text} className="colClas">{text}</div>;
};

export default class HashTopKey extends Component {
  static displayName = 'ClientList';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.queryCache = {};
    this.state = {
      dataSource: this.props.dataSource,
      total: 0,
      currentPage: '1',
      totalData: [],
      selectData: [],
      selected: '',
      value: {},

    };
    this.getData();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value }, () => {
      this.getData();
    });
  }
  getData = () => {
    if (this.state.value.id && this.state.value.timeSelected) {
      axiosInstance
        .get(`/rdb/top_key?pid=${this.state.value.id}&scheduleId=${this.state.value.timeSelected}&type=5`)
        .then((response) => {
          if (response.data.code === 200 && response.data.data) {
            this.setState({ total: response.data.data.length, totalData: response.data.data }, () => {

            });
            this.getPageData(response.data.data);
          } else {
            Toast.error('Get Hash Top Key Faild!');
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  getPageData(data) {
    const page = (this.state.currentPage - 1) * 10;
    const newArray = data.slice(page, page + 10);
    this.setState({ dataSource: newArray }, () => {
    });
  }

  changePage = (currentPage) => {
    this.setState({ currentPage }, () => {
      this.getPageData(this.state.totalData);
    });
  };

  onSort(value, order) {
    let dataSource = [];
    if (value === 'bytes') {
      dataSource = this.state.totalData.sort((a, b) => {
        if (order === 'asc') {
          return parseInt(a.bytes, 10) - parseInt(b.bytes, 10);
        } else if (order === 'desc') {
          return parseInt(b.bytes, 10) - parseInt(a.bytes, 10);
        }
      });
    } else if (value === 'itemCount') {
      dataSource = this.state.totalData.sort((a, b) => {
        if (order === 'asc') {
          return parseInt(a.itemCount, 10) - parseInt(b.itemCount, 10);
        } else if (order === 'desc') {
          return parseInt(b.itemCount, 10) - parseInt(a.itemCount, 10);
        }
      });
    } else {
      dataSource = this.state.totalData.sort((a, b) => {
        if (order === 'asc') {
          return a.key.localeCompare(b.key);
        } else if (order === 'desc') {
          return b.key.localeCompare(a.key);
        }
      });
    }
    this.setState({ dataSource });
    this.getPageData(dataSource);
  }
  render() {
    return (
      <div className="enhance-table" style={styles.enhanceTable}>
        <IceContainer>
          <Table
            dataSource={this.state.dataSource}
            className="basic-table"
            style={styles.basicTable}
            hasBorder={false}
            onSort={(value, order) => this.onSort(value, order)}
          >
            <Table.Column
              title="Key"
              dataIndex="key"
              width={100}
              cell={renderTime}
              sortable
            />
            <Table.Column
              title="Bytes"
              dataIndex="bytes"
              width={70}
              cell={formatBytes}
              sortable
            />
            <Table.Column
              title="ItemCount"
              dataIndex="itemCount"
              width={50}
              cell={formatterInput}
              sortable
            />
          </Table>
          <Pagination
            style={styles.pagination}
            defaultCurrent={1}
            pageSize={10}
            total={this.state.total}
            onChange={this.changePage}
          />
        </IceContainer>
      </div>
    );
  }
}

const styles = {
  extraFilter: {
    display: 'flex',
    alignItems: 'center',
  },
  search: {
    marginLeft: 10,
  },
  pagination: {
    textAlign: 'right',
    paddingTop: '26px',
  },
};
