import React, { useState, useEffect } from 'react';
import Participant from '../Participant/Participant';
import { styled, createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import useIsUserActive from '../Controls/useIsUserActive/useIsUserActive';
import useRoomState from '../../hooks/useRoomState/useRoomState';

import useParticipants from '../../hooks/useParticipants/useParticipants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';
import { useObjectVal } from 'react-firebase-hooks/database';
import { db } from '../../firebase';
import Draggable, { ControlPosition } from 'react-draggable';
import { setEnvironmentGlobal } from '@tensorflow/tfjs-core/dist/environment';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      right: '50%',
      transform: 'translate(50%, 30px)',
      bottom: '50px',
      zIndex: 1,
      transition: 'opacity 1.2s, transform 1.2s, visibility 0s 1.2s',
      opacity: 0,
      visibility: 'hidden',
      '&.showControls, &:hover': {
        transition: 'opacity 0.6s, transform 0.6s, visibility 0s',
        opacity: 1,
        visibility: 'visible',
        transform: 'translate(50%, 0px)',
      },
      [theme.breakpoints.down('xs')]: {
        bottom: `${theme.sidebarMobileHeight + 3}px`,
      },
    },
  })
);

export default function ParticipantStrip() {
  const classes = useStyles();
  const roomState = useRoomState();
  const isUserActive = useIsUserActive();
  const showControls = isUserActive || roomState === 'disconnected';
  const [position] = useObjectVal<ControlPosition>(db.ref('roomId/name'));

  const { room } = useVideoContext();
  const localParticipant = room.localParticipant;
  const roomName = room.name;
  const [dbRoom] = useObjectVal(db.ref('/' + roomName));
  const [background] = useObjectVal(db.ref('/' + roomName + '/background')) as any;

  const participants = useParticipants();
  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();

  const [currentBackground, setBackground] = useState(
    'url(https://image.shutterstock.com/image-photo/group-happy-friends-having-fun-260nw-1079761151.jpg)'
  );

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
    db.ref(`${roomName}/background`).set(newBackground);
    // setBackground(newBackground);
  }

  function changeOwnBackground(e) {
    const newBackground = `url(${e.target.value})`;
    setBackground(newBackground);
    db.ref(`${roomName}/background`).set(newBackground);
  }

  let initialPosition = { x: 0, y: 0 };

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

  return (
    <div
      style={{
        backgroundImage: currentBackground,
        backgroundSize: `100%`,
        height: '110vh',
      }}
    >
      <div
        // className={clsx(classes.container, { showControls })}
        style={{
          width: '99vw',
          position: 'absolute',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Dropdown options={options} onChange={changeBackground} placeholder={'Where you wanna go?'} />
      </div>
      <div
        className={clsx(classes.container, { showControls })}
        style={{
          position: 'relative',
          top: 39,
          display: 'flex',
          alignItems: 'flex-end',
          color: 'white',
          marginRight: '5px',
        }}
      >
        <label
          htmlFor="destinationInput"
          style={{ fontWeight: 500, WebkitTextStroke: '0.5px black', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          Choose your own destination!
        </label>
        <input name="destinationInput" type="text" placeholder="Input Image URL" onChange={changeOwnBackground}></input>
      </div>

      <Draggable
        position={
          dbRoom && dbRoom[localParticipant.identity] ? dbRoom[localParticipant.identity].position : initialPosition
        }
        onDrag={onStartDrag}
        onStop={handleDragStop}
        cancel="h4"
        bounds={{ top: 0, left: 0, right: window.innerWidth - 300, bottom: window.innerHeight - 300 }}
        ///height of the draggable area minus height of the navigation bar
      >
        <div style={{ width: '320px', height: '240px', position: 'absolute', top: 0, left: 0 }}>
          <Participant
            key={localParticipant.sid}
            participant={localParticipant}
            isSelected={selectedParticipant === localParticipant}
            onClick={() => setSelectedParticipant(localParticipant)}
          />
        </div>
      </Draggable>
      {participants.map(participant => (
        <Draggable
          key={participant.identity}
          position={dbRoom ? dbRoom[participant.identity].position : position}
          onDrag={onStartDrag}
          onStop={handleDragStop}
          cancel="h4"
          bounds={{ top: 0, left: 0, right: window.innerWidth - 300, bottom: window.innerHeight - 300 }}
        >
          <div style={{ width: '320px', height: '240px', position: 'absolute', top: 0, left: 0 }}>
            <Participant
              key={participant.sid}
              participant={participant}
              isSelected={selectedParticipant === participant}
              onClick={() => setSelectedParticipant(participant)}
            />
          </div>
        </Draggable>
      ))}
    </div>
  );
}
