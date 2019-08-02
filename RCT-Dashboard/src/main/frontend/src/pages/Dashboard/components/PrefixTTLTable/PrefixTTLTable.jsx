import React, { Component } from 'react';
import { Table, Pagination, Feedback, Search } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import axiosInstance from '../../../../axios';


import '../PrefixTTL.scss';

const renderTime = (text) => {
  return <div title={text} className="colClas">{text}</div>;
};
const formatterInput = (value) => {
    return value.toString().replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,');
  };
export default class PrefixTTLTable extends Component {
  static displayName = 'PrefixTTLTable';

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
        .get(`/rdb/chart/TTLAnalyze?pid=${this.state.value.id}&scheduleId=${this.state.value.timeSelected}`)
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
      if (values.prefix.indexOf(value.key) > -1 || values.TTL.indexOf(value.key) > -1 || values.noTTL.indexOf(value.key) > -1) {
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
  onSearchs = (value) => {
    const result = [];
    this.getSelectData();
    this.state.selectData.map((db) => {
      const reg = new RegExp(value);
      if (db.value.match(reg)) {
        const data = { value: db.value, label: db.label };
        result.push(data);
      }
    });
    this.setState({ selectData: result });
  }
  onSelect = (value) => {
    if (value === 'ALL') {
      this.fetchData();
    } else {
      this.getSearchData(value, null);
    }
  }
  onSort(value, order) {
    let dataSource = [];
    if(value === 'TTL' || value==='noTTL'){
        dataSource = this.state.totalData.sort((a, b) => {
            if (order === 'asc') {
              return a[value] - b[value];
            } else if (order === 'desc') {
              return b[value] - a[value];
            }
          });
    }else{
        dataSource = this.state.totalData.sort((a, b) => {
            if (order === 'asc') {
              return a[value].localeCompare(b[value]);
            } else if (order === 'desc') {
              return b[value].localeCompare(a[value]);
            }
          });
    }
    
    this.setState({ dataSource });
    this.getPageData(dataSource);
  }
  render() {
    return (

      <div >
        <span style={{ position: 'relative', textAlign: 'center', display: 'block', fontSize: '20px' }}> Keys TTL Info</span>
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
                title="Prefix"
                dataIndex="prefix"
                width={50}
                cell={renderTime}
                sortable
              />
              <Table.Column
                title="TTL"
                dataIndex="TTL"
                width={30}
                sortable
                cell={formatterInput}
              />
              <Table.Column title="noTTL" sortable dataIndex="noTTL" width={30}  cell={formatterInput} />

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

      </div>
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
