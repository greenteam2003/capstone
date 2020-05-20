// import Konva from 'konva';
import React from 'react';
// import { Stage, Layer, Circle } from 'react-konva';

const bodyPix = require('@tensorflow-models/body-pix');
// import regeneratorRuntime from 'regenerator-runtime';

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      camOn: false,
      _isMounted: false,
    };
    this.startCam = this.startCam.bind(this);
    this.stopCam = this.stopCam.bind(this);
    this.segmentAndMask = this.segmentAndMask.bind(this);
  }

  componentDidMount() {
    this.setState({
      _isMounted: true,
    });
  }

  componentWillUnmount() {
    this.setState({
      _isMounted: false,
    });
  }

  startCam() {
    var video = document.getElementById('video');
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function(stream) {
          video.srcObject = stream;
        })
        .then(() => {
          console.log('Turning on CAM');
          this.setState({ camOn: true });
        })
        .then(() => {
          this.segmentAndMask();
        })
        .catch(function(err0r) {
          console.log('Something went wrong!', err0r);
        });
    }
  }
  stopCam() {
    var video = document.getElementById('video');
    var stream = video.srcObject;
    var tracks = stream.getTracks();
    for (var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      track.stop();
    }
    video.srcObject = null;
    this.setState({ camOn: false });
    console.log('Turning OFF CAM');
  }

  async segmentAndMask() {
    console.log('WHAT is the STATE', this.state);
    if (this.state.camOn && this.state._isMounted) {
      let video, c_out, ctx_out, c_tmp, ctx_tmp, model;
      const bodyPixConfig = {
        architechture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 1,
        quantBytes: 4,
      };
      const segmentationConfig = {
        internalResolution: 'high',
        segmentationThreshold: 0.05,
        scoreThreshold: 0.05,
      };
      function init() {
        video = document.getElementById('video');
        //set ouput canvas
        c_out = document.getElementById('output-canvas');
        c_out.setAttribute('width', video.videoWidth);
        c_out.setAttribute('height', video.videoHeight);
        ctx_out = c_out.getContext('2d'); //get context of output canvas
        //Create canvas
        c_tmp = document.createElement('canvas');
        c_tmp.setAttribute('width', video.videoWidth);
        c_tmp.setAttribute('height', video.videoHeight);
        ctx_tmp = c_tmp.getContext('2d'); //get context of canvas
        video.play();
        computeFrame();
      }
      function computeFrame() {
        console.log('computing frames but for how long?');
        console.log('video in compute frame', video);
        //drawImage(image, dx, dy, dWidth, dHeight, )
        //image: element to draw into the canvas context
        //dx: x coordinate where to place top left corner of source image in the destination canvas
        //dWidth: width to draw the image in the destination canvas: allowing for scaling; default: won't scale image

        //Draws the video into the intial canvas
        ctx_tmp.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        //getImageData returns the imageData for the part of the inital canvas that is specified (ie. the whole canvas)
        let frame = ctx_tmp.getImageData(0, 0, video.videoWidth, video.videoHeight);
        //same as when we do net.segmentPerson
        //they pass in the canvas with the video drawn into it
        //then they get the imageData for the blank output canvas
        model.segmentPerson(c_tmp, segmentationConfig).then(segmentation => {
          ctx_out.clearRect(0, 0, c_out.width, c_out.height);
          let out_image = ctx_out.getImageData(0, 0, video.videoWidth, video.videoHeight);
          //ctx.getImageData(sx, sy, sw, sh)
          //sx: x-coordinate of from top-left corner from which ImageData will be extracted
          //sw: width or rectangle from which Image Data will be extrated
          for (let x = 0; x < video.videoWidth; x++) {
            for (let y = 0; y < video.videoHeight; y++) {
              //n = each pixel
              let n = x + y * video.videoWidth;
              //checks to see if ImageData = 1, which denotes the pixels of the person
              if (segmentation.data[n] == 1) {
                out_image.data[n * 4] = frame.data[n * 4]; //R
                out_image.data[n * 4 + 1] = frame.data[n * 4 + 1]; //G
                out_image.data[n * 4 + 2] = frame.data[n * 4 + 2]; //B
                out_image.data[n * 4 + 3] = frame.data[n * 4 + 3]; //A
              }
            }
          }

          //putImageData(imageData, dx, dy)
          //imageData: ImageData obj with array of pixel values
          //dx: x-coordinate where to put the imagedata in the destination canvas; destination canvas being: ctx_out
          ctx_out.putImageData(out_image, 0, 0);
          setTimeout(computeFrame, 0);
        });
      }

      bodyPix.load(bodyPixConfig).then(m => {
        //load will return bodyPix instance w/ provided bodyPixConfiguration
        model = m;
        init();
      });
    } else {
      console.log('Please turn on the camera first!');
    }
  }
  // continuouslySegmentAndMask() {
  //   //continuously renders next frame of video
  //   var video = document.getElementById('video');
  //   if (video.srcObject && this.state._isMounted) {
  //     requestAnimationFrame(() => {
  //       console.log('this', this);
  //       this.segmentAndMask();
  //     });
  //   }
  //   //if cam is running then continue this function if not, then stop this function
  //   //Also, check if component is mounted first before running this fn
  // }

  render() {
    console.log('PROPS', this.props);
    if (!navigator.mediaDevices.getUserMedia) {
      return <h2>Loading...</h2>;
    }
    return (
      <div>
        <div id="container">
          <video autoPlay={true} id="video" width="50" height="30" hidden />
          <div className="buttons">
            <button onClick={this.startCam}>START</button>
            <button onClick={this.stopCam}>STOP</button>
            <button onClick={this.segmentAndMask}>SEGMENT</button>
          </div>
          <hr />
          {/* OUTPUT CANVAS */}
          <canvas id="output-canvas" hidden />
        </div>
      </div>
    );
  }
}

// class Canvas extends React.Component {
// 	componentDidMount() {}

// 	render() {
// 		// const stage = new Konva.Stage({
// 		// 	container: 'container',
// 		// 	width: 500,
// 		// 	height: 500,
// 		// });
// 		// const layer = new Konva.Layer();

// 		// const circle = new Konva.Circle({
// 		// 	x: stage.width / 4,
// 		// 	y: stage.height / 2,
// 		// 	radius: 50,
// 		// 	fill: 'blue',
// 		// 	stroke: 'black',
// 		// 	strokeWidth: 3,
// 		// });

// 		// layer.add(circle);
// 		// stage.add(layer);
// 		// circle.on('click');

// 		// const amplitude = stage.width / 2;
// 		// const centerX = stage.width / 2;
// 		// const period = 2000; // in ms

// 		// const animation = new Konva.Animation(function(frame) {
// 		// 	circle.x(amplitude * Math.sin((frame.time * 2 * Math.PI) / period) + centerX);
// 		// }, layer);
// 		// animation.start();
// 		return (
// 			<Stage width={500} height={500}>
// 				<Layer>
// 					<Circle x={100} y={100} width={50} height={50} fill="blue" stroke="black" draggable />
// 				</Layer>
// 			</Stage>
// 		);
// 	}
// }

export default Canvas;
