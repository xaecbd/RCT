import React, { Component } from 'react';

export default class Logo extends Component {
  render() {
    return (
      <div style={styles.container}>
        <a href="/#/rct" style={styles.logoText}>
          RCT
        </a>
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '20px',
  },
  logoText: {
    display: 'block',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginLeft: '10px',
    fontSize: '22px',
    color: '#333',
    fontWeight: 'bold',
  },
};
