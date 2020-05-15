import React, { useState, useEffect } from 'react';
import ParticipantStrip from '../ParticipantStrip/ParticipantStrip';
import { styled } from '@material-ui/core/styles';
// import MainParticipant from '../MainParticipant/MainParticipant';
import Canvas from '../Canvas';
import { useList, useObjectVal } from 'react-firebase-hooks/database';
import { db } from '../../firebase.js';
const Container = styled('div')(({ theme }) => ({
  position: 'relative',
  height: '100%',
  display: 'grid',
  gridTemplateColumns: `1fr`,
  gridTemplateAreas: '"participantList"',
  gridTemplateRows: '90% 10%',
  [theme.breakpoints.down('xs')]: {
    gridTemplateAreas: '"participantList"',
    gridTemplateColumns: `auto`,
    gridTemplateRows: `calc(100% - ${theme.sidebarMobileHeight + 12}px) ${theme.sidebarMobileHeight + 6}px`,
    gridGap: '6px',
  },
}));

export default function Room() {
  // const [snapshots, loading, error] = useList(db.ref('John'));

  const [data, setData] = useState('');

  useEffect(() => {
    console.log(`this is your data ${data}`);
  });
  const [prompt, loading, error] = useObjectVal(db.ref('John'));
  console.log('prompt', prompt);
  return (
    <Container>
      <ParticipantStrip />
      <Canvas />
    </Container>
  );
}
