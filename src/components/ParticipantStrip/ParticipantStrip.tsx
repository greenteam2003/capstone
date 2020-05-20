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
  const [background] = useObjectVal(db.ref('/' + roomName + '/background')) as any;
  console.log('background', background);
  const participants = useParticipants();
  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();

  const [currentBackground, setBackground] = useState(
    'url(https://image.shutterstock.com/image-photo/group-happy-friends-having-fun-260nw-1079761151.jpg)'
  );

  // const [ localPosition, setLocalPosition ] = useState(
  // 	dbRoom ? dbRoom[localParticipant.identity].position : position
  // );
  // const [remotePosition, setRemotePosition] = useState(room ? room[participant.identity].position : position);

  ///our selected participan tshould always be either the previous selected partiicpant,
  ///or the new selected partiicpant, never null

  useEffect(() => {
    if (background) {
      setBackground(background);
    }
  });

  function onStartDrag(e, position) {
    e.preventDefault();
  }

  function handleDragStop(e, localPosition) {
    e.preventDefault();
    //grabbing participants name
    const participant = e.target.getElementsByTagName('h4')[0].innerText;

    const newPosition = { x: localPosition.x, y: localPosition.y };
    // updating new position in firebase
    db.ref(`${roomName}/${participant}/position`).set(newPosition);
  }
  function changeBackground(e) {
    const newBackground = e.value;
    const newLabel = e.label;
    db.ref(`${roomName}/background`).set(newBackground);
    setBackground(newBackground);
  }
  let initialPosition = { x: 0, y: 0 };
  // let initialBackground = background;
  // background
  // ? (initialBackground = background)
  // : (initialBackground =
  //     'url(https://image.shutterstock.com/image-photo/group-happy-friends-having-fun-260nw-1079761151.jpg)');
  // const defaultOption = 'Where you wanna go?';
  const [options] = useState([
    {
      label: 'Bada Bing',
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
  function handleImageUpload(e) {
    console.log('imageEvent', e);
  }

  // {
  //   dbRoom && dbRoom[background] ? setBackground(dbRoom[background].background) : setBackground(background);
  // }
  // dbRoom && dbRoom[background] ? dbRoom[background].background : initialBackground
  return (
    // <Container>
    //   <ScrollContainer>
    ///check out transpotion of x and y values
    <div>
      <div
        style={{
          backgroundImage: currentBackground,
          backgroundSize: `100%`,
        }}
      />
      <div style={{ width: '300px', height: '200px', position: 'absolute', top: 200, left: 0 }}>
        <input
          type="file"
          accept="image/*"
          onChange={e => handleImageUpload(e)}
          multiple={false}
          id="avatar"
          name="avatar"
        />
      </div>
      <div style={{ width: '300px', position: 'absolute', top: 0, left: window.innerWidth - 300 }}>
        <Dropdown options={options} onChange={changeBackground} placeholder={'Where you wanna go?'} />
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
