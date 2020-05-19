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

  const { room } = useVideoContext();
  const localParticipant = room.localParticipant;
  const roomName = room.name;
  const [dbRoom] = useObjectVal(db.ref('/' + roomName));

  const participants = useParticipants();
  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();

  // const [ localPosition, setLocalPosition ] = useState(
  // 	dbRoom ? dbRoom[localParticipant.identity].position : position
  // );
  // const [remotePosition, setRemotePosition] = useState(room ? room[participant.identity].position : position);
  const [ourParticipant, setOurParticipant] = useState(selectedParticipant);

  ///our selected participan tshould always be either the previous selected partiicpant,
  ///or the new selected partiicpant, never null

  // useEffect(() => {
  //   if (selectedParticipant) {
  //     setOurParticipant(selectedParticipant);
  //   }
  // });

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
    console.log('new log in handlestop');
    console.log('localPosition', localPosition);
    e.preventDefault();
    console.log('target', e.target);
    // console.log('H4?', e.target.getElementsByTagName('h4'));
    const participant = e.target.getElementsByTagName('h4')[0].innerText;
    console.log('participant', participant);
    // console.log('room', roomName);
    // console.log('localPosition', localPosition);
    // console.log('DBROOM', dbRoom);
    const newPosition = { x: localPosition.x, y: localPosition.y };

    db.ref(`${roomName}/${participant}/position`).set(newPosition);

    console.log('johns position', localPosition);

    // send to firebase
    ///
  }
  let initialPosition = { x: 0, y: 0 };
  return (
    // <Container>
    //   <ScrollContainer>
    ///check out transpotion of x and y values
    <div
      style={{
        backgroundImage:
          'url(https://image.shutterstock.com/image-photo/group-happy-friends-having-fun-260nw-1079761151.jpg)',
        backgroundSize: `100%`,
      }}
    >
      ///
      <Draggable
        position={
          dbRoom && dbRoom[localParticipant.identity] ? dbRoom[localParticipant.identity].position : initialPosition
        }
        onDrag={onStartDrag}
        onStop={handleDragStop}
      >
        <div style={{ width: '300px', height: '200px', position: 'absolute', top: 0, left: 0 }}>
          <Participant
            key={localParticipant.sid}
            participant={localParticipant}
            isSelected={selectedParticipant === localParticipant}
            onClick={() => setSelectedParticipant(localParticipant)}
          />
        </div>
      </Draggable>
      {participants.map(participant => (
        ///how is it achieving that absolute position?
        ///absolutely relative to what?
        //anything above it WITH A POSITION

        <Draggable
          key={participant.identity}
          position={dbRoom ? dbRoom[participant.identity].position : position}
          onDrag={onStartDrag}
          onStop={handleDragStop}
        >
          <div style={{ width: '300px', height: '200px', position: 'absolute', top: 0, left: 0 }}>
            <Participant
              key={participant.sid}
              participant={participant}
              isSelected={selectedParticipant === participant}
              onClick={() => setSelectedParticipant(participant)}
            />
          </div>
        </Draggable>
        //{' '}
      ))}
    </div>
    //   </ScrollContainer>
    // </Container>
  );
}

// const { error, setError } = useAppState();
