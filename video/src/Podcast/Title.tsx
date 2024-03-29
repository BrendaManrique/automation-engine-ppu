import { log } from 'console';
import Segment from 'models/Segments';
import { useCallback, useMemo } from 'react';
import {Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const Title: React.FC<{
	data: any//Segment[]
}> = ({data }) => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();

	const segments: Segment[] = data[0].segments;

	console.log("RENDER DATA TITLE ->",JSON.stringify(data));

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
			return segments.map(({text, start, end}, index) => {
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
							/*return (
									<span 
											key={`word${index}`}
											style={{
													display: 'inline-block',
													fontSize: isTitle ? 65 : 45,
													fontWeight:  isTitle ? 700 : 300,
													
													color: "#3897db",
													borderRadius: 16,
													padding: `0px 4px`,
											}}>
											{text} 
									</span>
							);*/
							return (
								<span 
										key={`word${index}`}
										style={{
												display: 'inline-block',
												fontSize: isTitle ? 85 : 65,  //increased font size
												fontWeight:  isTitle ? 800 : 400, //chunkier text
												textShadow: `0 0 10px #3897db, 0 0 20px #3897db, 0 0 30px #3897db, 0 0 40px #3897db`, //neon glow
												color: `rgba(255, 255, 255, ${animation})`,
												borderRadius: 16,
												transition: '0.5s ease', //transition for fade in and fade out effect
										}}>
										{text} 
								</span>
						);
					} else {
							return null;
					}
			});
	}, [frame]);

	return (
		<div style={{padding: orientation === 'landscape' ? 50 : 100,
		position: 'absolute',
		width: '100%',
		height: '100%',
		display: 'flex',
		alignItems: 'flex-end',
		zIndex:2}}>
			<div><h1
				style={{
					fontFamily: 'Nunito',
					alignSelf: 'center',
					opacity,
					margin: 0,
					textAlign: 'center',
					fontVariant: 'all-small-caps'
				}}
			>
                {buildSegments}
				{/* {text.map((t, i, arr) => {
					const frameTime = frame / videoConfig.fps;
                    const wordShouldAppear = segments[t]

                    console.log(wordShouldAppear)

					if (i <= indexOfEndOfTitle) {
						return (
							<>
								<span
									key={t}
									style={{
										color: `${
											wordShouldAppear
												? '#fff'
												: '#497399'
										}`,
										display: 'inline-block',
										fontSize: 65,
										fontWeight: 700,
									}}
								>
									{t}
								</span>
								{i === indexOfEndOfTitle ? <br /> : <> </>}
							</>
						);
					}

					return (
						<span
							key={t}
							style={{
								marginLeft: 5,
								marginRight: 5,
								color: `${
									wordShouldAppear ? '#fff' : '#497399'
								}`,
								display: 'inline-block',
								fontWeight: 300,
								fontSize: 45,
							}}
						>
							{t}
						</span>
					);
				})} */}
			</h1> </div>
		</div>
	);
};
