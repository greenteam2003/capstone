import React, { useRef, useState, useEffect } from 'react';
import { IVideoTrack } from '../../types';
// import { styled } from '@material-ui/core/styles';
import { Track } from 'twilio-video';

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
  console.log('TRACK', track);

  useEffect(() => {
    const myVideo = document.createElement('video');
    myVideo.setAttribute('objectFit', 'fill');
    myVideo.setAttribute('width', `${track.dimensions.width}`);
    myVideo.setAttribute('height', `${track.dimensions.height}`);
    setVideo(myVideo);
    const el = ref.current; //set to the video when there's a change
    console.log('What is el', el);

    // el.muted = true;
    myVideo.muted = true;
    if (track.setPriority && priority) {
      track.setPriority(priority);
    }
    // track.attach(el);
    // console.log('TRACK inside useEffect before Change', track);
    // track.dimensions.width = 320;
    // track.dimensions.height = 240;
    // console.log('TRACK inside useEffect After Change', track);
    track.attach(myVideo);
    console.log('MY VIDEO', myVideo);
    console.log('playing video');
    // el.play();
    myVideo.play();

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
    //temp canvas
    const canvas2 = document.createElement('canvas');
    canvas2.setAttribute('width', `${track.dimensions.width}`);
    canvas2.setAttribute('height', `${track.dimensions.height}`);
    const canvas2ctx = canvas2.getContext('2d');

    function drawVideo() {
      if (video && ref.current) {
        canvas2ctx.drawImage(video, 0, 0, track.dimensions.width, track.dimensions.height);
        const frame = canvas2ctx.getImageData(0, 0, track.dimensions.width, track.dimensions.height);

        const cctx = ref.current.getContext('2d'); //ref referring to output canvas below
        cctx.clearRect(0, 0, track.dimensions.width, track.dimensions.height);
        let out_image = cctx.getImageData(0, 0, track.dimensions.width, track.dimensions.height);

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
        cctx.putImageData(out_image, 0, 0);
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
  }, [video, track.dimensions.width, track.dimensions.height]);

  // The local video track was mirrored.
  // const isFrontFacing = track.mediaStreamTrack.getSettings().facingMode !== 'environment';
  // const style = isLocal && isFrontFacing ? { transform: 'rotateY(180deg)' } : {};

  // return <Video id="Video" ref={ref} style={style} />;
  return (
    <canvas
      ref={ref}
      style={{ width: '100%', height: '100%' }}
      width={track.dimensions.width}
      height={track.dimensions.height}
    />
  );
}
