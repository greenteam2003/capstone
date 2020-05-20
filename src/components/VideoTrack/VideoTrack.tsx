import React, { useRef, useState, useEffect } from 'react';
import { IVideoTrack } from '../../types';
import { styled } from '@material-ui/core/styles';
import { Track } from 'twilio-video';

//returns a component with the defined style below
const Video = styled('video')({
  //Creates Video Element
  //change to canvas
  width: '100%',
  maxHeight: '100%',
  objectFit: 'fill',
});

// const Video = document.getElementById('Video');
// Video.setAttribute('width', '100%');
// Video.setAttribute('maxHeight', '100%');
// Video.setAttribute('objectFit', 'fill');

//const outputCanvas = document.getElementById("output-canvas")

interface VideoTrackProps {
  track: IVideoTrack;
  isLocal?: boolean;
  priority?: Track.Priority | null;
}

export default function VideoTrack({ track, isLocal, priority }: VideoTrackProps) {
  const [video, setVideo] = useState(null);
  const ref = useRef<any>(null!);
  // const ref = useRef<HTMLVideoElement>(null!); //returns mutable obj w/ .current initialized to passed arg (ie. null!)
  //when Video ref={ref} changes, .current is set to that ref's Dom Node (ie. Video)
  console.log('What the ref', ref);
  // const MyVideo = document.getElementById('Video');
  console.log('TRACK', track);
  // const Canvas = document.createElement('canvas');
  // Canvas.setAttribute('width', String(track.dimensions.width));
  // Canvas.setAttribute('height', String(track.dimensions.height));
  // const CanvasCtx = Canvas.getContext('2d');

  // const Canvas2 = document.createElement('canvas') as any;
  // console.log('CANVAS 2', Canvas2);
  // Canvas2.setAttribute('width', String(track.dimensions.width));
  // Canvas2.setAttribute('height', String(track.dimensions.height));
  // const Canvas2Ctx = Canvas2.getContext('2d');

  function computeVideo(el, CCtx, C2Ctx) {
    //Video is not what we think it is... all zeros currently
    CCtx.drawImage(el, 0, 0, track.dimensions.width, track.dimensions.height); // draw video to canvas
    console.log('computingVideo, canvas context', CCtx);

    const frame = CCtx.getImageData(0, 0, track.dimensions.width, track.dimensions.height); //get frame of video from canvas
    console.log('FRAME', CCtx.getImageData(0, 0, track.dimensions.width, track.dimensions.height));

    // limeGreen = {r: 0, g:255, b:0, a:255}

    C2Ctx.clearRect(0, 0, track.dimensions.width, track.dimensions.height);
    let out_image = C2Ctx.getImageData(0, 0, track.dimensions.width, track.dimensions.height);
    for (let i = 0, n = frame.data.length; i < n; i += 4) {
      let r = frame.data[i],
        g = frame.data[i + 1],
        b = frame.data[i + 2];
      if (r !== 0 && g !== 255 && b !== 0) {
        //if pixel not green, draw that pixel onto Canvas2
        out_image.data[n * 4] = frame.data[n * 4]; //R
        out_image.data[n * 4 + 1] = frame.data[n * 4 + 1]; //G
        out_image.data[n * 4 + 2] = frame.data[n * 4 + 2]; //B
        out_image.data[n * 4 + 3] = frame.data[n * 4 + 3]; //A
      }
    }
    C2Ctx.putImageData(out_image, 0, 0);

    requestAnimationFrame(() => computeVideo);
  }
  useEffect(() => {
    const myVideo = document.createElement('video');
    myVideo.setAttribute('objectFit', 'fill');
    myVideo.setAttribute('width', '100%');
    myVideo.setAttribute('maxHeight', '100%');
    setVideo(myVideo);
    const el = ref.current; //set to the video when there's a change in...something
    console.log('What is el', el);

    // el.muted = true;
    myVideo.muted = true;
    if (track.setPriority && priority) {
      track.setPriority(priority);
    }
    //Track's Mediastream from #output-canvas is not attaching appropriately
    // track.attach(el); //attaches video track to "empty?" HTMLVideoElement
    track.attach(myVideo);
    console.log('MY VIDEO', myVideo);
    console.log('playing video');
    // el.play(); //playing the video
    myVideo.play();

    // computeVideo(myVideo, CanvasCtx, Canvas2Ctx);
    return () => {
      track.detach(myVideo);
      if (track.setPriority && priority) {
        // Passing `null` to setPriority will set the track's priority to that which it was published with.
        track.setPriority(null);
      }
      setVideo(null);
    };
  }, [track, priority]);

  useEffect(() => {
    let stopLoop = false;
    const canvas2 = document.createElement('canvas'); //temp canvas
    canvas2.setAttribute('width', '640');
    canvas2.setAttribute('height', '480');
    const canvas2ctx = canvas2.getContext('2d');
    function drawVideo() {
      if (video && ref.current) {
        // debugger;
        // console.log('VIDEO Width', video.width);
        // console.log('VIDEO Height', video.height);
        canvas2ctx.drawImage(video, 0, 0, 640, 480);
        const frame = canvas2ctx.getImageData(0, 0, 640, 480);
        // console.log('Frame', frame);

        // ref.current.setAttribute('width', '640');
        // ref.current.setAttribute('height', '480');
        const cctx = ref.current.getContext('2d'); //ref referring to output canvas below
        cctx.clearRect(0, 0, 640, 480);
        let out_image = cctx.getImageData(0, 0, 640, 480);
        // console.log('Canvas 1', cctx);
        // console.log('FRAME DATA', frame.data);
        // console.log('Video', video);

        for (let i = 0, n = frame.data.length; i < n; i += 4) {
          let r = frame.data[i],
            g = frame.data[i + 1],
            b = frame.data[i + 2];
          if ((r !== 0 && g !== 255 && b !== 0) || (r !== 0 && g !== 254 && b !== 1)) {
            //if pixel not green, draw that pixel onto Canvas2
            out_image.data[i] = frame.data[i]; //R
            out_image.data[i + 1] = frame.data[i + 1]; //G
            out_image.data[i + 2] = frame.data[i + 2]; //B
            out_image.data[i + 3] = frame.data[i + 3]; //A
          }
        }
        // debugger;
        // console.log('OUT_IMAGE', out_image);
        //will later draw modified frame here
        cctx.putImageData(out_image, 0, 0);
        // cctx.scale(0.5, 0.5);
      }
      if (stopLoop === false) {
        requestAnimationFrame(drawVideo);
      }
    }
    requestAnimationFrame(drawVideo);
    return () => {
      //helps to prevent multiple requestAnimations from running
      stopLoop = true;
    };
  }, [video]);

  // The local video track is mirrored.
  const isFrontFacing = track.mediaStreamTrack.getSettings().facingMode !== 'environment';
  const style = isLocal && isFrontFacing ? { transform: 'rotateY(180deg)' } : {};

  //check if video is not local & then process, by either passing in video frame data or actual video to bodypix, taking out background, convert back to video,
  //const mediaStreamTrack = canvas.captureStream(25).getVideoTracks()[0];

  //put in a canvas instead of a video
  // return <Video id="Video" ref={ref} style={style} />;
  return <canvas ref={ref} width="640" height="480" />;
}

//Track needs to be attached to something... a video... in order for ComputeVideo to work & draw it onto canvas
