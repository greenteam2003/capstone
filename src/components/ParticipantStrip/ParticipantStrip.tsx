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
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

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

  const [background, setBackground] = useState(
    'url(https://image.shutterstock.com/image-photo/group-happy-friends-having-fun-260nw-1079761151.jpg)'
  );

  // const [ localPosition, setLocalPosition ] = useState(
  // 	dbRoom ? dbRoom[localParticipant.identity].position : position
  // );
  // const [remotePosition, setRemotePosition] = useState(room ? room[participant.identity].position : position);

  ///our selected participan tshould always be either the previous selected partiicpant,
  ///or the new selected partiicpant, never null

  // useEffect(() => {
  //   if (selectedParticipant) {
  //     setOurParticipant(selectedParticipant);
  //   }
  // });

  function onStartDrag(e, position) {
    e.preventDefault();
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

    // send to firebase
    ///
  }
  function changeBackground(e) {
    console.log('event', e);
    console.log('e.value', e.value);
    setBackground(e.value);
  }
  let initialPosition = { x: 0, y: 0 };
  const defaultOption = 'zero';
  const [options] = useState([
    {
      label: 'BadaBing',
      value: 'url(https://melmagazine.com/wp-content/uploads/2019/01/badabing-1280x533.jpg)',
    },
    {
      label: 'BBQ',
      value: 'url(https://image.shutterstock.com/image-photo/group-happy-friends-having-fun-260nw-1079761151.jpg)',
    },
    {
      label: 'European getaway',
      value:
        'url(https://c8.alamy.com/comp/G24JXH/summer-holidays-vacation-happy-people-concept-group-of-friends-jumping-G24JXH.jpg)',
    },
    {
      label: 'Summer vibes',
      value:
        'url(https://previews.123rf.com/images/gmast3r/gmast3r1709/gmast3r170901279/85853167-young-people-group-tropical-beach-palm-trees-friends-walking-speaking-holiday-sea-summer-vacation-oc.jpg)',
    },
  ]);
  return (
    // <Container>
    //   <ScrollContainer>
    ///check out transpotion of x and y values
    <div
      style={{
        backgroundImage: background,
        backgroundSize: `100%`,
      }}
    >
      ///
      <div>
        <Dropdown
          options={options}
          value={defaultOption}
          placeholder="Where you wanna go?"
          onChange={changeBackground}
        />
      </div>
      <Draggable
        position={
          dbRoom && dbRoom[localParticipant.identity] ? dbRoom[localParticipant.identity].position : initialPosition
        }
        onDrag={onStartDrag}
        onStop={handleDragStop}
        bounds={{ top: 0, left: 0, right: window.innerWidth - 300, bottom: window.innerHeight - 300 }}
        ///height of the draggable area minus height of the navigation bar
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
          bounds={{ top: 0, left: 0, right: window.innerWidth - 300, bottom: window.innerHeight - 300 }}
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
