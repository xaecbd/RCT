import React, { Component } from 'react';
import { Table, Pagination, Search } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import axiosInstance from '../../../../axios';
import '../PrefixTTL.scss';

const renderTime = (text) => {
  return <div title={text} className="colClas">{text}</div>;
};
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
export default class KeyCountTable extends Component {
  static displayName = 'KeyCountTable';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.queryCache = {};
    this.state = {
      dataSource: [],
      total: 0,
      currentPage: '1',
      totalData: [],     
      value: {},
    };    
  }

  // 接受父组件的变化的state值
  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value }, () => {
      this.getData();
    });
  }
  getData = () => {
    if (this.state.value.id && this.state.value.timeSelected) {
      axiosInstance
        .get(`/rdb/table/prefix?pid=${this.state.value.id}&scheduleId=${this.state.value.timeSelected}`)
        .then((response) => {
          if (response.data.code === 200 && response.data.data) {
            this.setState({ total: response.data.data.length, totalData: response.data.data }, () => {

            });
            this.getPageData(response.data.data);
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


  onSearch = (value) => {
    const data = this.state.totalData;
    const array = [];
    data.map((values) => {
      if (values.prefixKey.indexOf(value.key) > -1 || values.keyCount.indexOf(value.key) > -1) {
        array.push(values);
      }
    });
    if (array.length > 0) {
      this.setState({
        total: array.length,
      });
      this.getPageData(array);
    }
  }

  onSort(value, order) {
    let dataSource = [];
    if (value === 'memorySize') {
      dataSource = this.state.totalData.sort((a, b) => {      
        if (order === 'asc') {
          return parseInt(a.memorySize, 10) - parseInt(b.memorySize, 10);
        } else if (order === 'desc') {
          return parseInt(b.memorySize, 10) - parseInt(a.memorySize, 10);
        }
      });
    } else if (value === 'keyCount') {
      dataSource = this.state.totalData.sort((a, b) => {     
        if (order === 'asc') {
          return parseInt(a.keyCount, 10) - parseInt(b.keyCount, 10);
        } else if (order === 'desc') {
          return parseInt(b.keyCount, 10) - parseInt(a.keyCount, 10);
        }
      });
    } else {
      dataSource = this.state.totalData.sort((a, b) => {
        if (order === 'asc') {
          return a.prefixKey.localeCompare(b.prefixKey);
        } else if (order === 'desc') {
          return b.prefixKey.localeCompare(a.prefixKey);
        }
      });
    }
    this.setState({ dataSource });
    this.getPageData(dataSource);
  }
  render() {
    return (
      <IceContainer>
        <IceContainer>
          <div style={styles.extraFilter}>
            <Search
              style={styles.search}
              type="primary"
              inputWidth={100}
              placeholder="select"
              searchText=""
              onSearch={this.onSearch}
            />
          </div>
        </IceContainer>

        <div className="enhance-table" style={styles.enhanceTable}>        

          <Table
            dataSource={this.state.dataSource}       
            className="basic-table"
            style={styles.basicTable}
            hasBorder={false}
            onSort={(value, order) => this.onSort(value, order)}
          >
            <Table.Column
              title="PrefixKey"
              dataIndex="prefixKey"
              width={50}
              cell={renderTime}
              sortable
            />
            <Table.Column title="Count" sortable dataIndex="keyCount" width={30} cell={formatterInput} />
            <Table.Column title="Memory Size" sortable dataIndex="memorySize" cell={formatBytes} width={30} />
          </Table>
          <Pagination
            style={styles.pagination}
            defaultCurrent={1}
            pageSize={10}
            total={this.state.total}
            onChange={this.changePage}
          />        
        </div>
      </IceContainer>
    );
  }
}

const styles = {   
  extraFilter: {
    display: 'flex',
    alignItems: 'center',
    float: 'right',
  },
  search: {
    marginLeft: 10,
  },
  pagination: {
    textAlign: 'right',
    paddingTop: '26px',
  },
};
