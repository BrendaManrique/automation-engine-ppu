import { log } from 'console';
import Segment from 'models/Segments';
import { useCallback, useMemo, useRef } from 'react';
import {Video,Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig, staticFile, OffthreadVideo} from 'remotion';
import background from '../../../assets/teacher_green.mp4';
import img1 from '../../../assets/renderimg1.png';

export const Background: React.FC<{
	data: any
}> = ({data }) => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();
	const scaleRef = useRef(1);


	console.log("RENDERDATA->",data);

	// Generate a random translation between -20 and 20 pixels
	//const randomTranslate = useMemo(() => -10 + Math.random() * 20, []);
	// Generate a random scaling factor between 0.95 and 1.05
	const randomScale = useMemo(() => Math.sin(frame / videoConfig.durationInFrames * Math.PI * 2) * 0.20 + 1, [frame]);
	const randomDirection = useMemo(() => Math.random() < 0.5, [data.sentence]);

	const orientation = videoConfig.width > videoConfig.height ? 'landscape' : 'portrait';
    const indexOfEndOfTitle = 0;//segments.findIndex(segment => segment.word.includes(':'))
		const keywords = ["important", "highlight", "focus"]; 

	const opacity = spring({
		fps: videoConfig.fps,
		from: 0,
		to: 1,
		frame,
		config: {mass: 1, damping: 1000},
	});

		const buildSegments = useMemo(() => { 
			return data.map(({sentence, start, end,resourceUrl}, index) => {
					console.log("RESOURCE URL:",resourceUrl, staticFile(resourceUrl));
					resourceUrl = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

					const startInFrames = start / (1000 / videoConfig.fps) * 1000;
					const endInFrames = end / (1000 / videoConfig.fps) * 1000;
					const wordShouldAppear = frame >= startInFrames && frame < endInFrames;
					const isTitle = index <= indexOfEndOfTitle;
	
					let animation = 0;
					if (wordShouldAppear) {
							const duration = endInFrames - startInFrames;
							let animationInFrames = 1;
							while (duration < animationInFrames * 2) {
									animationInFrames -= 0.1;
							}
	
							const secondStep = startInFrames + animationInFrames;
							const thirdStep = endInFrames - animationInFrames + 0.001;
	
							animation = interpolate(
								frame,
								[startInFrames, secondStep, thirdStep, endInFrames],
								[0, 1, 1, 0],
								{
										easing: Easing.bezier(0, 0.3, 1, 0.7),
								}
							);
					}
	
					// Only render if wordShouldAppear is true
					//background: `rgba(250, 250, 250, ${animation})`,
					if (wordShouldAppear) {
						if(scaleRef.current === 1){
							scaleRef.current = Math.sin(frame / videoConfig.durationInFrames * Math.PI * 4) * 0.01 + 1;
						}
						const imageStyle: any = {
							display: 'inline-block',
							borderRadius: 16,
							padding: '0px 4px',
							position: 'absolute',
							width: '100%',
							height: '100%',
							transition: '0.5s ease',
							transform: `scale(${scaleRef.current})`,
       
						};

						return (
								<Video
										key={`video-${resourceUrl}`}
										//src={staticFile(resourceUrl)}
										src={resourceUrl}
								/>
						);
						
					} else {
							scaleRef.current = 1;
							return null;
					}
			});
	}, [frame]);

	return (
		<div style={{padding: orientation === 'landscape' ? 50 : 0,
		position: 'absolute',
		width: '100%',
		height: '100%',}}>
				{buildSegments}
		</div>
	);
};
/*
<img
										key={`img${index}`}
										src={resourceUrl}
										alt={sentence}
										style={imageStyle}
								/> */