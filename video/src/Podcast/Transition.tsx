import React from 'react';
import {
	spring,
	SpringConfig,
	useCurrentFrame,
	useVideoConfig,
	Audio,
	Img,
	delayRender,
} from 'remotion';
import styled from 'styled-components';

import transitionAudioSrc from '../../../assets/transition.mp3';
import transitionlogo from '../../../assets/transitionlogo.gif';
import {Arc} from './Arc';


const Container = styled.div`
	flex: 1;
	justify-content: 'center';
	align-items: 'center';
`;

export const Transition: React.FC<{}> = () => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const springConfig: SpringConfig = {
		damping: 10,
		mass: 0.1,
		stiffness: 5,
		overshootClamping: true,
	};
	const scale = spring({
		config: springConfig,
		from: 0,
		to: 1,
		fps: videoConfig.fps,
		frame: frame,
	});

	const arcs = (
		<>
			<Arc rotation={0 + 30} />
			<Arc rotation={120 + 30} />
			<Arc rotation={240 + 30} />
		</>
	);

	return (
		<>
			<Audio src={transitionAudioSrc} placeholder="" onPointerEnterCapture onPointerLeaveCapture />
			{/*<Container>
				<div
					style={{
						transform: `scale(${scale})`,
					}}
				>
					{/*<svg
						style={{
							width: videoConfig.width,
							height: videoConfig.height,
							position: 'absolute',
							zIndex: 4,
						}}
					>
						<defs>
							<linearGradient id="lg">
								<stop stopColor="#4290f5" offset="0" />
								<stop stopColor="#42e9f5" offset="1" />
							</linearGradient>
							<mask id="mask">{arcs}</mask>
						</defs>
						{arcs}
					</svg>*/}
				{/*	<Img style={{
							width: videoConfig.height,
							height: videoConfig.height,
							position: 'absolute' ,
							marginLeft: videoConfig.height/2.75,
							zIndex: 4,
						}}
						src={transitionlogo}></Img>
				</div>
			{/*</Container>*/}
		</>
	);
};
