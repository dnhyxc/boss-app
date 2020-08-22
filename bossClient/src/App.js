import React, { Component } from 'react'
import { Button } from 'antd-mobile';
export default class App extends Component {
  render() {
    return (
      <div>
      <Button type="primary">Primary</Button>
      <Button>Default</Button>
      <Button type="dashed">Dashed</Button>
      <Button type="link">Link</Button>
    </div>
    )
  }
}


