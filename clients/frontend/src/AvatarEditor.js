import React, { Component } from 'react';
import { Button } from 'react-materialize';
import AvatarEditor from 'react-avatar-editor'

class AvatarEditorConsole extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rotate: 0
    }
  };

  rotateLeft = e => {
    e.preventDefault()

    this.setState({
      rotate: this.state.rotate - 90,
    })
  }

  rotateRight = e => {
    e.preventDefault()
    this.setState({
      rotate: this.state.rotate + 90,
    })
  }


  render() {
    return (
      <section>
        <AvatarEditor
            image={this.props.image}
            width={250}
            height={250}
            border={50}
            scale={1.2}
            rotate={parseFloat(this.state.rotate)}
        />
        Rotate:
        <Button onClick={this.rotateLeft}>Left</Button>
        <Button onClick={this.rotateRight}>Right</Button>
      </section>
  );
};

}
export default AvatarEditorConsole;

