import React from 'react';
import { styled } from '@material-ui/core/styles';

import Controls from './components/Controls/Controls';
import LocalVideoPreview from './components/LocalVideoPreview/LocalVideoPreview';
import MenuBar from './components/MenuBar/MenuBar';
import ReconnectingNotification from './components/ReconnectingNotification/ReconnectingNotification';
import Room from './components/Room/Room';

import useHeight from './hooks/useHeight/useHeight';
import useRoomState from './hooks/useRoomState/useRoomState';

const Container = styled('div')({
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
});

const Main = styled('main')({
  overflow: 'hidden',
});

export default function App() {
  const roomState = useRoomState();

  // Here we would like the height of the main container to be the height of the viewport.
  // On some mobile browsers, 'height: 100vh' sets the height equal to that of the screen,
  // not the viewport. This looks bad when the mobile browsers location bar is open.
  // We will dynamically set the height with 'window.innerHeight', which means that this
  // will look good on mobile browsers even after the location bar opens or closes.
  const height = useHeight();

  return (
    <Container style={{ height }}>
      <MenuBar />
      <Main>
        {roomState === 'disconnected' ? (
          <div>
            <LocalVideoPreview />
            <div
              style={{
                width: '600px',
                position: 'absolute',
                top: window.innerHeight / 3,
                right: 400,
              }}
            >
              <h2>Welcome to Gather. Enter your room code to join your friends, or make your own to create a room</h2>
            </div>
          </div>
        ) : (
          <Room />
        )}
        <Controls />
      </Main>
      <ReconnectingNotification />
    </Container>
  );
}
