import React, { Component } from 'react';
import {
  Select,
  Search,
  Table,
  Pagination,
  Feedback,
  Loading,
} from '@icedesign/base';
import IceContainer from '@icedesign/container';
import axiosInstance from '../../../../axios';

const Toast = Feedback.toast;
export default class Statistics extends Component {
  static displayName = 'TabTable';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      currentPage: 1,
      totalData: [],
      tempTotalData: [],
      total: 0,
      values: {
        groupBy: '',
        id: sessionStorage.getItem('pid'),
      },
      pageList: [10, 20, 50],
      pageSize: 0,
      isSearch: '',
      loading: false,
    };
  }

  getPageData(data) {
    const page = (this.state.currentPage - 1) * this.state.pageSize;
    let newArray = data.slice(page, page + this.state.pageSize);
    if (newArray.length === 0) {
      newArray = data.slice(0, 0 + this.state.pageSize);
    }
    this.setState({ dataSource: newArray, loading: false }, () => {});
  }

  changePage = (currentPage) => {
    this.changeLoading();
    this.setState({ currentPage }, () => {
      if (this.state.isSearch !== '') {
        this.getPageData(this.state.tempTotalData);
      } else {
        this.getPageData(this.state.totalData);
      }
    });
  };

  changeLoading = () => {
    this.setState({
      loading: false,
    });
  };

  onSort(value, order) {
    this.changeLoading();
    let dataSource = [];
    if (this.state.isSearch === '') {
      this.state.tempTotalData = this.state.totalData;
    }
    if (value === 'count') {
      dataSource = this.state.tempTotalData.sort((a, b) => {
        if (order === 'asc') {
          return a[value] - b[value];
        } else if (order === 'desc') {
          return b[value] - a[value];
        }
      });
    } else {
      dataSource = this.state.tempTotalData.sort((a, b) => {
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

  onSearchChange = (value) => {
    this.setState({ isSearch: value });
  };

  onSearch = (value) => {
    this.changeLoading();
    if (value.key !== '') {
      this.getSearchData(this.state.values.groupBy, value.key);
    } else {
      this.onGroupSelect(this.state.values.groupBy);
    }
  };

  handlePageSizeChange = (size) => {
    this.changeLoading();
    this.setState(
      {
        pageSize: size,
      },
      () => {
        this.getPageData(this.state.totalData);
      }
    );
  };

  getSearchData = (value, data) => {
    const tempTotalData = [];
    for (let j = 0; j < this.state.totalData.length; j++) {
      if (this.state.totalData[j].ip.indexOf(data) !== -1) {
        tempTotalData.push(this.state.totalData[j]);
      }
    }
    this.getPageData(tempTotalData);
    this.setState({ total: tempTotalData.length, tempTotalData }, () => {});
  };

  onGroupSelect = (value) => {
    this.state.values.groupBy = value;
    this.setState({
      values: this.state.values,
    });
    axiosInstance
      .post('/client_list/statistics/', this.state.values)
      .then((res) => {
        if (res.data.code === 200) {
          this.setState(
            {
              total: res.data.data.length,
              totalData: res.data.data,
            },
            () => {}
          );
          this.getPageData(res.data.data);
        } else {
          Toast.error('Get Data Faild!');
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  render() {
    if (this.state.pageSize === 0) {
      this.setState({
        pageSize: 10,
      });
    }
    return (
      <div className="tab-table">
        <Loading
          tip="Loading..."
          shape="fusion-reactor"
          visible={this.state.loading}
          style={{ width: '100%', height: '100%' }}
        >
          <IceContainer style={styles.card}>
            <div style={styles.formItem}>
              <span style={{ minWidth: '70px' }}>Statistical: </span>
              &nbsp;&nbsp;
              <Select onChange={e => this.onGroupSelect(e)}>
                <Select.Option value="0">server</Select.Option>
                <Select.Option value="1">client</Select.Option>
              </Select>
            </div>

            <div style={styles.extraFilter}>
              <Search
                style={styles.search}
                type="primary"
                inputWidth={150}
                placeholder="select"
                searchText=""
                onSearch={this.onSearch}
                onChange={(value) => {
                  this.onSearchChange(value);
                }}
              />
            </div>
          </IceContainer>
          <IceContainer style={{ padding: '0 20px 20px' }}>
            <Table
              dataSource={this.state.dataSource}
              className="basic-table"
              hasBorder={false}
              onSort={(value, order) => this.onSort(value, order)}
            >
              <Table.Column title="IP" dataIndex="ip" width={70} sortable />
              <Table.Column
                title="Count"
                dataIndex="count"
                width={70}
                sortable
              />
            </Table>
            <Pagination
              style={styles.pagination}
              defaultCurrent={1}
              pageSize={this.state.pageSize}
              total={this.state.total}
              onChange={this.changePage}
              pageSizeSelector="dropdown"
              pageSizePosition="end"
              onPageSizeChange={this.handlePageSizeChange}
              pageSizeList={this.state.pageList}
            />
          </IceContainer>
        </Loading>
      </div>
    );
  }
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
  },
  extraFilter: {
    display: 'flex',
    alignItems: 'center',
  },
  card: {
    minHeight: 0,
    marginBottom: 20,
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  formItem: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0',
  },
  pagination: {
    textAlign: 'right',
    paddingTop: '26px',
    float: 'right',
  },
};
