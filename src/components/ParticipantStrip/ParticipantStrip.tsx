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
  const [room] = useObjectVal(db.ref('roomId'));

  // useEffect(() => {
  //   // function createRoomRef(){
  //   // const [room] = useObjectVal(db.ref('roomId'));
  //   console.log('Room', room);
  //   // }
  // });

  const {
    room: { localParticipant },
  } = useVideoContext();
  const participants = useParticipants();
  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();

  const [helloPosition, setHelloPosition] = useState(position);
  const [localPosition, setLocalPosition] = useState(room ? room[localParticipant.identity].position : position);
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
    console.log(e.target.firstChild.innerText);
    if (ourParticipant) {
      console.log('ourParticipant in start', ourParticipant);
      if (ourParticipant.identity === localParticipant.identity) {
        setLocalPosition(position);
      } else {
        console.log('test');
      }
    }
  }

  function handleDragStop(e, position) {
    e.preventDefault();

    const participant = e.target.firstChild.innerText;

    const newPosition = { x: position.x, y: position.y };
    ////works every other time

    db.ref(`roomId/${participant}/position`).set(newPosition);

    // send to firebase
  }
  console.log('selectedParticipant', selectedParticipant);

  return (
    // <Container>
    //   <ScrollContainer>
    <div>
      <Draggable
        position={room ? room[localParticipant.identity].position : position}
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
          position={room ? room[participant.identity].position : position}
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
