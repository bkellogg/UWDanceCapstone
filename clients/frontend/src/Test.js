import React, { Component } from 'react';
import * as Util from './util';

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

  updateImage = (img) => {
    let file = img
    console.log(file)
    let data = new FormData();
    data.append("image", file);
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status < 400) {
          return xhr.responseText
        }
      }
    };

    xhr.open("POST", "https://dasc.capstone.ischool.uw.edu/api/v1/users/me/photo");
    xhr.setRequestHeader("Authorization", Util.getAuth());
    xhr.setRequestHeader("ImageFieldName", "image");
    xhr.setRequestHeader("Content-Type", "multipart/form-data");

    xhr.send(file);
  }

  handleNewImage = e => {
    this.setState({ image: e.target.files[0] })
  }

  handleSave = data => {
    const img = this.editor.getImageScaledToCanvas().toDataURL()

    this.setState({
      preview: {
        img,
        width: this.state.width,
        height: this.state.height,
        borderRadius: this.state.borderRadius,
      },
    })

    this.updateImage(img)
  }

  handleScale = e => {
    const scale = parseFloat(e.target.value)
    this.setState({ scale })

  }

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

  setEditorRef = editor => {
    if (editor) this.editor = editor
  }

  handlePositionChange = position => {
    this.setState({ position })
  }

  handleDrop = acceptedFiles => {
    this.setState({ image: acceptedFiles[0] })
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
