// import Konva from 'konva';
import React from 'react';
import { Stage, Layer, Circle } from 'react-konva';

class Canvas extends React.Component {
  componentDidMount() {}

  render() {
    // const stage = new Konva.Stage({
    // 	container: 'container',
    // 	width: 500,
    // 	height: 500,
    // });
    // const layer = new Konva.Layer();

    // const circle = new Konva.Circle({
    // 	x: stage.width / 4,
    // 	y: stage.height / 2,
    // 	radius: 50,
    // 	fill: 'blue',
    // 	stroke: 'black',
    // 	strokeWidth: 3,
    // });

    // layer.add(circle);
    // stage.add(layer);
    // circle.on('click');

    // const amplitude = stage.width / 2;
    // const centerX = stage.width / 2;
    // const period = 2000; // in ms

    // const animation = new Konva.Animation(function(frame) {
    // 	circle.x(amplitude * Math.sin((frame.time * 2 * Math.PI) / period) + centerX);
    // }, layer);
    // animation.start();
    return (
      <Stage width={500} height={500}>
        <Layer>
          <Circle x={100} y={100} width={50} height={50} fill="blue" stroke="black" draggable />
        </Layer>
      </Stage>
    );
  }
}

export default Canvas;
