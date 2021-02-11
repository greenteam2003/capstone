import React from 'react';
const bodyPix = require('@tensorflow-models/body-pix');

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
    this.startCam();
  }

  componentWillUnmount() {
    this.setState({
      _isMounted: false,
    });
    this.stopCam();
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
        segmentationThreshold: 0.3, 
        scoreThreshold: 0.7,
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
      

        //Draws the video into the intial canvas

        ctx_tmp.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        //getImageData returns the imageData for the part of the inital canvas that is specified (ie. the whole canvas)

        let frame = ctx_tmp.getImageData(0, 0, video.videoWidth, video.videoHeight);


        model.segmentPerson(c_tmp, segmentationConfig).then(segmentation => {
          ctx_out.clearRect(0, 0, c_out.width, c_out.height);
          let out_image = ctx_out.getImageData(0, 0, video.videoWidth, video.videoHeight);
          //ctx.getImageData(sx, sy, sw, sh)
          //sx: x-coordinate of from top-left corner from which ImageData will be extracted
          //sw: width or rectangle from which Image Data will be extracted

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
              } else {
                out_image.data[n * 4] = 0; //R
                out_image.data[n * 4 + 1] = 255; //G
                out_image.data[n * 4 + 2] = 0; //B
                out_image.data[n * 4 + 3] = 255; //A
              }
            }
          }

          //putImageData(imageData, dx, dy)
          //dx: x-coordinate where to put the imagedata in the destination canvas; destination canvas being: ctx_out
          ctx_out.putImageData(out_image, 0, 0);
          requestIdleCallback(computeFrame);
        });
      }

      bodyPix.load(bodyPixConfig).then(m => {
        //load will return bodyPix instance w/ provided bodyPixConfiguration
        model = m;
        init();
      });
    } else {
    }
  }

  render() {
    if (!navigator.mediaDevices.getUserMedia) {
      return <h2>Loading...</h2>;
    }
    return (
      <div>
        <div id="container">
          <video autoPlay={true} id="video" width="320" height="240" hidden />
          <div className="buttons" />

          {/* OUTPUT CANVAS */}
          <canvas id="output-canvas" width="320" height="240" hidden />
        </div>
      </div>
    );
  }
}

export default Canvas;
