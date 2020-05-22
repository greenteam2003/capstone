import { LocalVideoTrack } from 'twilio-video';
import { useCallback } from 'react';
import useVideoContext from '../useVideoContext/useVideoContext';

export default function useLocalVideoToggle() {
  const {
    room: { localParticipant },
    localTracks,
    getLocalVideoTrack,
  } = useVideoContext();
  console.log('FINDING LOCAL TRACKS: ', localTracks);
  const videoTrack = localTracks.find(track => track.kind.includes('video')) as LocalVideoTrack;

  const toggleVideoEnabled = useCallback(() => {
    if (videoTrack) {
      videoTrack.dimensions.width = 320;
      videoTrack.dimensions.height = 240;
      if (localParticipant) {
        const localTrackPublication = localParticipant.unpublishTrack(videoTrack);
        // TODO: remove when SDK implements this event. See: https://issues.corp.twilio.com/browse/JSDK-2592
        localParticipant.emit('trackUnpublished', localTrackPublication);
      }
      videoTrack.stop();
    } else {
      getLocalVideoTrack().then((track: LocalVideoTrack) => {
        if (localParticipant) {
          track.dimensions.width = 320;
          track.dimensions.height = 240;
          localParticipant.publishTrack(track, { priority: 'low' });
        }
      });
    }
  }, [videoTrack, localParticipant, getLocalVideoTrack]);

  return [!!videoTrack, toggleVideoEnabled] as const;
}
