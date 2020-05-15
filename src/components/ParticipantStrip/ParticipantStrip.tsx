import React, { useState } from 'react';
import Participant from '../Participant/Participant';
import { styled } from '@material-ui/core/styles';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';
import { useObjectVal } from 'react-firebase-hooks/database';
import { db } from '../../firebase';
import Draggable, { ControlPosition } from 'react-draggable';
// const Container = styled('div')(({ theme }) => ({
// 	padding: '0.5em',
// 	overflowY: 'auto',
// 	[theme.breakpoints.down('xs')]: {
// 		overflowY: 'initial',
// 		overflowX: 'auto',
// 		padding: 0,
// 		display: 'flex',
// 	},
// }));

// const ScrollContainer = styled('div')(({ theme }) => ({
// 	[theme.breakpoints.down('xs')]: {
// 		display: 'flex',
// 	},
// }));

export default function ParticipantStrip() {
  const { room } = useVideoContext();
  const localParticipant = room.localParticipant;
  const roomName = room.name;
  const participants = useParticipants();
  // console.log('participats', participants);
  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();

  // const [position] = useObjectVal<ControlPosition>(db.ref(`/${roomName}/${localParticipant.identity}/position`));
  const [roomObject] = useObjectVal<ControlPosition>(db.ref(`/${roomName}`));
  // const positionArray = participants.map(participant => {
  //   const [participantsPosition] = useObjectVal<ControlPosition>(
  //     db.ref(`/${roomName}/${participant.identity}/position`)
  //   );
  //   return participantsPosition;
  // });
  function handleDragStop(e, localPosition) {
    e.preventDefault();
    const newPosition = { x: localPosition.x, y: localPosition.y };

    ///set
    console.log('event target', e.target);
    db.ref(`/${roomName}/${localParticipant.identity}/position`).set(newPosition);

    // send to firebase
  }

  return (
    // <Container>
    //   <ScrollContainer>
    <div>
      <Draggable position={roomObject[localParticipant.identity].position} onStop={handleDragStop}>
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
        <Draggable position={roomObject[participant.identity].position} onStop={handleDragStop}>
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
