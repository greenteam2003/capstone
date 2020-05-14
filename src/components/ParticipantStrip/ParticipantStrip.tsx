import React, { useState, useEffect } from 'react';
import Participant from '../Participant/Participant';
import { styled } from '@material-ui/core/styles';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';
import { useObjectVal } from 'react-firebase-hooks/database';
import { db } from '../../firebase';
import Draggable, { ControlPosition } from 'react-draggable';

const Container = styled('div')(({ theme }) => ({
  padding: '0.5em',
  overflowY: 'auto',
  [theme.breakpoints.down('xs')]: {
    overflowY: 'initial',
    overflowX: 'auto',
    padding: 0,
    display: 'flex',
  },
}));

const ScrollContainer = styled('div')(({ theme }) => ({
  [theme.breakpoints.down('xs')]: {
    display: 'flex',
  },
}));

export default function ParticipantStrip() {
  const [position] = useObjectVal<ControlPosition>(db.ref('roomId/name'));
  const [room] = useObjectVal(db.ref('roomId'));

  // useEffect(() => {
  //   // function createRoomRef(){
  //   // const [room] = useObjectVal(db.ref('roomId'));
  //   console.log('Room', room);
  //   // }
  // });

  const [helloPosition, setHelloPosition] = useState(position);
  const {
    room: { localParticipant },
  } = useVideoContext();
  const participants = useParticipants();
  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();

  function onStartDrag(e, position) {
    e.preventDefault();
    setHelloPosition(position);
  }
  function handleDragStop(e, position) {
    e.preventDefault();
    console.log('STOP');
    console.log('position X', position.x);
    console.log('position y', position.y);

    const newPosition = { x: position.x, y: position.y };

    ///set
    db.ref('participants').set(newPosition);

    // send to firebase
  }
  console.log('Local', localParticipant);
  console.log('Remote', participants);
  console.log('room', room);
  console.log('Position', position);
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
            // onClick={() => setSelectedParticipant(participant)}
          />
        </div>
      </Draggable>
      {participants.map(participant => (
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
              // onClick={() => setSelectedParticipant(participant)}
            />
          </div>
        </Draggable>
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
