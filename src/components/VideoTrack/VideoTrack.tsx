import React, { useRef, useEffect } from 'react';
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

// const Video = document.getElementById('Video')
// Video.setAttribute('width', '100%')
// Video.setAttribute('maxHeight', '100%')
// Video.setAttribute('objectFit', 'fill')

//const outputCanvas = document.getElementById("output-canvas")

interface VideoTrackProps {
  track: IVideoTrack;
  isLocal?: boolean;
  priority?: Track.Priority | null;
}

export default function VideoTrack({ track, isLocal, priority }: VideoTrackProps) {
  const ref = useRef<HTMLVideoElement>(null!); //returns mutable obj w/ .current initialized to passed arg (ie. null!)
  //when Video ref={ref} changes, .current is set to that ref's Dom Node (ie. Video)
  console.log('What the ref', ref);
  // const MyVideo = document.getElementById("Video")
  // const Canvas = document.createElement('canvas');
  // Canvas.setAttribute('width', Video.width);
  //   Canvas.setAttribute('height', String(el.videoHeight));
  //   const CanvasCtx = Canvas.getContext('2d');

  // const Canvas2 = document.createElement('canvas');
  // Canvas2.setAttribute('width', String(el.videoWidth));
  // Canvas2.setAttribute('height', String(el.videoHeight));
  // const Canvas2Ctx = Canvas2.getContext('2d');

  // function computeVideo(el, CanvasCtx, Canvas2Ctx) {
  //   // requestAnimationFrame(() => {
  //   Canvas2Ctx.clearRect(0, 0, el.videoWidth, el.videoHeight);
  //   let out_image = Canvas2Ctx.getImageData(0, 0, el.videoWidth, el.videoHeight);

  //   CanvasCtx.drawImage(el, 0, 0, el.videoWidth, el.videoHeight); // draw video to canvas
  //   console.log('computingVideo, canvas context', CanvasCtx);
  //   console.log(CanvasCtx.getImageData(0, 0, el.videoWidth, el.videoHeight));
  //   const frame = CanvasCtx.getImageData(0, 0, el.videoWidth, el.videoHeight); //get frame of video from canvas
  //   // limeGreen = {r: 0, g:255, b:0, a:255}
  //   const transparent = { r: 0, g: 0, b: 0, a: 0 };
  //   Canvas2Ctx.clearReact(0, 0);
  //   for (let i = 0, n = frame.data.length; i < n; i += 4) {
  //     let r = frame.data[i],
  //       g = frame.data[i + 1],
  //       b = frame.data[i + 2];
  //     if (r !== 0 && g !== 255 && b !== 0) {
  //       //if pixel not green, draw
  //       out_image.data[n * 4] = frame.data[n * 4]; //R
  //       out_image.data[n * 4 + 1] = frame.data[n * 4 + 1]; //G
  //       out_image.data[n * 4 + 2] = frame.data[n * 4 + 2]; //B
  //       out_image.data[n * 4 + 3] = frame.data[n * 4 + 3]; //A
  //     }
  //   }
  //   Canvas2Ctx.putImageData(out_image, 0, 0);
  //   // });
  //   requestAnimationFrame(() => computeVideo);
  // }

  useEffect(() => {
    const el = ref.current; //set to the video when there's a change in...something
    console.log('What is el', el);
    // Canvas.setAttribute('width', String(el.videoWidth));
    // Canvas.setAttribute('height', String(el.videoHeight));
    // const CanvasCtx = Canvas.getContext('2d');

    // Canvas2.setAttribute('width', String(el.videoWidth));
    // Canvas2.setAttribute('height', String(el.videoHeight));
    // const Canvas2Ctx = Canvas.getContext('2d');

    el.muted = true;
    if (track.setPriority && priority) {
      track.setPriority(priority);
    }
    track.attach(el); //attaches video track to "empty?" HTMLVideoElement
    console.log('playing video');
    el.play(); //playing the video
    // computeVideo(el, CanvasCtx, Canvas2Ctx);
    return () => {
      track.detach(el);
      if (track.setPriority && priority) {
        // Passing `null` to setPriority will set the track's priority to that which it was published with.
        track.setPriority(null);
      }
    };
  }, [track, priority /*, Canvas, Canvas2*/]);

  // The local video track is mirrored.
  const isFrontFacing = track.mediaStreamTrack.getSettings().facingMode !== 'environment';
  const style = isLocal && isFrontFacing ? { transform: 'rotateY(180deg)' } : {};

  //check if video is not local & then process, by either passing in video frame data or actual video to bodypix, taking out background, convert back to video,
  //const mediaStreamTrack = canvas.captureStream(25).getVideoTracks()[0];

  //put in a canvas instead of a video
  return <Video id="Video" ref={ref} style={style} />;
}
