import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import ReactAvatarEditor from 'react-avatar-editor'
import Dropzone from 'react-dropzone'
import "./styling/General.css"

class Test extends Component {
  state = {
    image: this.props.img,
    allowZoomOut: false,
    position: { x: 0.5, y: 0.5 },
    scale: 1,
    rotate: 0,
    borderRadius: 0,
    preview: null,
    width: 300,
    height: 300,
  }

  handleNewImage = e => {
    this.setState({ image: e.target.files[0] })
    this.props.changeImg(this.editor.getImageScaledToCanvas().toDataURL())
  }

  handleSave = data => {
    const img = this.editor.getImageScaledToCanvas().toDataURL()
    const rect = this.editor.getCroppingRect()

    this.setState({
      preview: {
        img,
        width: this.state.width,
        height: this.state.height,
        borderRadius: this.state.borderRadius,
      },
    })
    this.props.changeImg(this.editor.getImageScaledToCanvas().toDataURL())
  }

  handleScale = e => {
    const scale = parseFloat(e.target.value)
    this.setState({ scale })
    this.props.changeImg(this.editor.getImageScaledToCanvas().toDataURL())
  }

  rotateLeft = e => {
    e.preventDefault()

    this.setState({
      rotate: this.state.rotate - 90,
    })
    this.props.changeImg(this.editor.getImageScaledToCanvas().toDataURL())
  }

  rotateRight = e => {
    e.preventDefault()
    this.setState({
      rotate: this.state.rotate + 90,
    })
    this.props.changeImg(this.editor.getImageScaledToCanvas().toDataURL())
  }

  setEditorRef = editor => {
    if (editor) this.editor = editor
  }

  handlePositionChange = position => {
    this.setState({ position })
    this.props.changeImg(this.editor.getImageScaledToCanvas().toDataURL())
  }

  handleDrop = acceptedFiles => {
    this.setState({ image: acceptedFiles[0] })
    this.props.changeImg(this.editor.getImageScaledToCanvas().toDataURL())
  }

  render() {
    return (
      <div>
        <Dropzone
          onDrop={this.handleDrop}
          disableClick
          multiple={false}
          style={{ width: this.state.width, height: this.state.height, marginBottom:'35px' }}
        >
          <div>
            <ReactAvatarEditor
              ref={this.setEditorRef}
              scale={parseFloat(this.state.scale)}
              width={this.state.width}
              height={this.state.height}
              position={this.state.position}
              onPositionChange={this.handlePositionChange}
              rotate={parseFloat(this.state.rotate)}
              borderRadius={this.state.borderRadius}
              onSave={this.handleSave}
              image={this.state.image}
            />
          </div>
        </Dropzone>
        <br />
        New File:
        <input name="newImage" type="file" onChange={this.handleNewImage} />
        <br />
        Zoom:
        <input
          name="scale"
          type="range"
          onChange={this.handleScale}
          min={this.state.allowZoomOut ? '0.1' : '1'}
          max="2"
          step="0.01"
          defaultValue="1"
        />
        <br />

        Rotate:
        <button onClick={this.rotateLeft}>Left</button>
        <button onClick={this.rotateRight}>Right</button>
        <br />
        <br />
        <input type="button" onClick={this.handleSave} value="Preview" />
        <br />
        {!!this.state.preview && (
          <img
            src={this.state.preview.img}
            style={{
              borderRadius: `${(Math.min(
                this.state.preview.height,
                this.state.preview.width
              ) +
                10) *
                (this.state.preview.borderRadius / 2 / 100)}px`,
            }}
          />
        )}
      </div>
    )
  }
}

export default Test;
