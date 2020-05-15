import React, { useState, useEffect } from 'react';
import Participant from '../Participant/Participant';
import { styled } from '@material-ui/core/styles';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';
import { useObjectVal } from 'react-firebase-hooks/database';
import { db } from '../../firebase';
import Draggable, { ControlPosition } from 'react-draggable';
import { setEnvironmentGlobal } from '@tensorflow/tfjs-core/dist/environment';

// const Container = styled('div')(({ theme }) => ({
//   padding: '0.5em',
//   overflowY: 'auto',
//   [theme.breakpoints.down('xs')]: {
//     overflowY: 'initial',
//     overflowX: 'auto',
//     padding: 0,
//     display: 'flex',
//   },
// }));

// const ScrollContainer = styled('div')(({ theme }) => ({
//   [theme.breakpoints.down('xs')]: {
//     display: 'flex',
//   },
// }));

export default function ParticipantStrip() {
  const [position] = useObjectVal<ControlPosition>(db.ref('roomId/name'));
  const [dbRoom] = useObjectVal(db.ref());

  const { room } = useVideoContext();
  const localParticipant = room.localParticipant;
  const roomName = room.name;

  const participants = useParticipants();
  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();

  // const [ localPosition, setLocalPosition ] = useState(
  // 	dbRoom ? dbRoom[localParticipant.identity].position : position
  // );
  // const [remotePosition, setRemotePosition] = useState(room ? room[participant.identity].position : position);
  const [ourParticipant, setOurParticipant] = useState(selectedParticipant);

  ///our selected participan tshould always be either the previous selected partiicpant,
  ///or the new selected partiicpant, never null

  useEffect(() => {
    if (selectedParticipant) {
      setOurParticipant(selectedParticipant);
    }
  });

  function onStartDrag(e, position) {
    e.preventDefault();

    if (ourParticipant) {
      if (ourParticipant.identity === localParticipant.identity) {
        console.log('hmm');
      } else {
        console.log('test');
      }
    }
  }

  function handleDragStop(e, localPosition) {
    console.log('localPosition', localPosition);
    e.preventDefault();

    const participant = e.target.firstChild.innerText;
    console.log('participant', participant);
    console.log('room', roomName);
    console.log('localPosition', localPosition);

    if (!isNaN(localPosition.x) && isNaN(localPosition.y)) {
      const newPosition = { x: localPosition.x, y: localPosition.y };

      db.ref(`${roomName}/${participant}/position`).update(newPosition);
    }
    console.log();

    // send to firebase
  }

  return (
    // <Container>
    //   <ScrollContainer>
    <div>
      <Draggable
        position={dbRoom && dbRoom[localParticipant.identity] ? dbRoom[localParticipant.identity].position : position}
        onDrag={onStartDrag}
        onStop={handleDragStop}
      >
        <div style={{ width: '300px', height: '200px' }}>
          <Participant
            key={localParticipant.sid}
            participant={localParticipant}
            isSelected={selectedParticipant === localParticipant}
            onClick={() => setSelectedParticipant(localParticipant)}
          />
        </div>
      </Draggable>
      {participants.map(participant => (
        // <div>
        //   <div className={participant.identity} />
        <Draggable
          position={dbRoom ? dbRoom[participant.identity].position : position}
          onDrag={onStartDrag}
          onStop={handleDragStop}
        >
          <div style={{ width: '300px', height: '200px' }}>
            <Participant
              key={participant.sid}
              participant={participant}
              isSelected={selectedParticipant === participant}
              onClick={() => setSelectedParticipant(participant)}
            />
          </div>
        </Draggable>
        // </div>
      ))}
    </div>
    //   </ScrollContainer>
    // </Container>
  );
}

// const { error, setError } = useAppState();

// return (
//   <Stage>
//     <Layer>
//       <VideoProvider options={connectionOptions} onError={setError}>
//         <Participant
//           participant={localParticipant}
//           isSelected={selectedParticipant === localParticipant}
//           onClick={() => setSelectedParticipant(localParticipant)}
//         />
//         {participants.map(participant => (
//           <Participant
//             key={participant.sid}
//             participant={participant}
//             isSelected={selectedParticipant === participant}
//             onClick={() => setSelectedParticipant(participant)}
//           />
//         ))}
//       </VideoProvider>
//     </Layer>
//   </Stage>
// );
