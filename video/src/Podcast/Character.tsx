import { log } from 'console';
import Segment from 'models/Segments';
import { useCallback, useMemo, useRef, useEffect} from 'react';
import {Loop,Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig, interpolateColors, Video, AbsoluteFill} from 'remotion';

import greenVideo from '../../../assets/teacher_green.mp4';

export const Character: React.FC<{
	data: any,
	src: string
}> = ({data, src }) => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();

	const orientation = videoConfig.width > videoConfig.height ? 'landscape' : 'portrait';

	const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { width, height } = useVideoConfig();
 
  // Process a frame
  const onVideoFrame = useCallback(
    (opacity: number) => {
      if (!canvas.current || !video.current) {
        return;
      }
      const context = canvas.current.getContext("2d");
 
      if (!context) {
        return;
      }
 
      context.drawImage(video.current, 0, 0, width, height);
      const imageFrame = context.getImageData(0, 0, width, height);
      const { length } = imageFrame.data;
 
      // If the pixel is very green, reduce the alpha channel
      for (let i = 0; i < length; i += 4) {
        const red = imageFrame.data[i + 0];
        const green = imageFrame.data[i + 1];
        const blue = imageFrame.data[i + 2];
        if (green > 100 && red < 100 && blue < 100) {
          imageFrame.data[i + 3] = opacity * 255;
        }
      }
      context.putImageData(imageFrame, 0, 0);
    },
    [height, width]
  );
 
  useEffect(() => {
    const { current } = video;
    if (!current || !current.requestVideoFrameCallback) {
      return;
    }
    let handle = 0;
    const callback = () => {
      onVideoFrame(0);
      handle = current.requestVideoFrameCallback(callback);
    };
 
    callback();
 
    return () => {
      current.cancelVideoFrameCallback(handle);
    };
  }, [onVideoFrame, 0]);
 
	

		const buildSegments = useMemo(() => {
			return data.map(({sentence, start, end,resourceUrl}, index) => {
					const startInFrames = start / (1000 / videoConfig.fps) * 1000;
					const endInFrames = end / (1000 / videoConfig.fps) * 1000;
			
						return (
							<div>
								<AbsoluteFill>
                <Loop durationInFrames={1000}>
									<Video
										ref={video}
										style={{ opacity: 0 }}
										startFrom={0}
										// If we access the data of a remote video, we must add this prop, and the remote video must have CORS enabled
										crossOrigin="anonymous"
                    
										src={greenVideo}
										volume={0}
									/>
                  </Loop>
								</AbsoluteFill>
								<AbsoluteFill>
									<canvas ref={canvas} width={width} height={height} />
								</AbsoluteFill>
							</div>
						);
						
					
			});
	}, [frame]);

	return (
		<div style={{padding: orientation === 'landscape' ? 50 : 0,
		position: 'relative',
		display:'flex',
		width: '100%',
		height: '100%',
    marginRight: 'auto',
    marginTop: 'auto'}}>
				{buildSegments}
		</div>
	);
};
