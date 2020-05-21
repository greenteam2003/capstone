import { useCallback, useEffect, useState } from 'react';

import { ensureMediaPermissions } from '../../../utils';
import Video, { LocalVideoTrack, LocalAudioTrack, CreateLocalTrackOptions } from 'twilio-video';

export function useLocalAudioTrack() {
  const [track, setTrack] = useState<LocalAudioTrack>();

  const getLocalAudioTrack = useCallback((deviceId?: string) => {
    const options: CreateLocalTrackOptions = {};

    if (deviceId) {
      options.deviceId = { exact: deviceId };
    }

    return ensureMediaPermissions().then(() =>
      Video.createLocalAudioTrack(options).then(newTrack => {
        setTrack(newTrack);
        return newTrack;
      })
    );
  }, []);

  useEffect(() => {
    getLocalAudioTrack();
  }, [getLocalAudioTrack]);

  useEffect(() => {
    const handleStopped = () => setTrack(undefined);
    if (track) {
      track.on('stopped', handleStopped);
      return () => {
        track.off('stopped', handleStopped);
      };
    }
  }, [track]);

  return [track, getLocalAudioTrack] as const;
}

export function useLocalVideoTrack() {
  const [track, setTrack] = useState<LocalVideoTrack>();

  const getLocalVideoTrack = useCallback((newOptions?: CreateLocalTrackOptions) => {
    // In the DeviceSelector and FlipCameraButton components, a new video track is created,
    // then the old track is unpublished and the new track is published. Unpublishing the old
    // track and publishing the new track at the same time sometimes causes a conflict when the
    // track name is 'camera', so here we append a timestamp to the track name to avoid the
    // conflict.
    const options: CreateLocalTrackOptions = {
      frameRate: 24,
      height: 720,
      width: 1280,
      name: `camera-${Date.now()}`,
      ...newOptions,
    };

    // could hijack what navigator.getUserMedia does to instead reference canvas.captureStream()
    // if we did this 'monkey-chaining', then can we grab audio from the original getUserMedia, and video from canvas.captureStream()

    // let originalMediaDevicesGetUserMedia = navigator.mediaDevices.getUserMedia;

    // navigator.mediaDevices.getUserMedia = function(constraints) {
    // 	console.log('OUR NEW FUNCTION IS WORKING');
    // 	return new Promise<MediaStream>((resolve, reject) => {
    // 		originalMediaDevicesGetUserMedia
    // 			.bind(navigator.mediaDevices)(constraints)
    // 			.then(stream => resolve(/*enhance*/ stream))
    // 			.catch(reject);
    // 	});
    // };

    // const enhance = () => {
    // 	const canvas = document.getElementById('myCanvas') as any;
    // 	const stream = canvas.captureStream(25);
    // 	return stream;
    // };

    return ensureMediaPermissions().then(() => {
      const canvas = document.getElementById('output-canvas') as any;
     
      if (canvas) {
        const canvasCaptureStream = canvas.captureStream(25).getVideoTracks();
        if (canvas.captureStream(25).getVideoTracks().length > 0) {
          const mediaStreamTrack = canvas.captureStream(25).getVideoTracks()[0];
          const canvasVideoTrack = new LocalVideoTrack(mediaStreamTrack);
          setTrack(canvasVideoTrack);
          return canvasVideoTrack;
        } else {
          Video.createLocalVideoTrack(options).then(newTrack => {
            setTrack(newTrack);
            return newTrack;
          });
        }
      }
    });
  }, []);

  useEffect(() => {
    // We get a new local video track when the app loads.
    getLocalVideoTrack();
  }, [getLocalVideoTrack]);

  useEffect(() => {
    const handleStopped = () => setTrack(undefined);
    if (track) {
      track.on('stopped', handleStopped);
      return () => {
        track.off('stopped', handleStopped);
      };
    }
  }, [track]);

  return [track, getLocalVideoTrack] as const;
}

export default function useLocalTracks() {
  const [audioTrack, getLocalAudioTrack] = useLocalAudioTrack();
  const [videoTrack, getLocalVideoTrack] = useLocalVideoTrack();

  const localTracks = [audioTrack, videoTrack].filter(track => track !== undefined) as (
    | LocalAudioTrack
    | LocalVideoTrack
  )[];

  return { localTracks, getLocalVideoTrack, getLocalAudioTrack };
}
