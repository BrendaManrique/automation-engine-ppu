import React, {useEffect, useState} from 'react';
import {
	interpolate, 
	useCurrentFrame, 
	useVideoConfig, 
	Video, 
	delayRender,
	continueRender} from 'remotion';
import { getVideoMetadata } from "@remotion/media-utils";
import {getAudioData} from '@remotion/media-utils';

export const VideoSegment: React.FC<{
	src: string;
}> = ({src}) => {
	const {width: videoWidth, durationInFrames} = useVideoConfig();
	const frame = useCurrentFrame();
	const [handle] = useState(() => delayRender());
  const [videoDuration, setDuration] = useState(1);


	useEffect(() => {
		getVideoMetadata(
			src
		)
		.then(({ durationInSeconds }) => {
			setDuration(Math.round(durationInSeconds * 30));
			continueRender(handle);
		})
		.catch((err) => {
			console.log(`Error fetching metadata: ${err}`);
		});
	}, [handle]);

	return (
		<>
			<Video src={src} />
			
		</>
	);
};
