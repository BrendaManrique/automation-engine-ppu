import { useEffect, useState } from 'react';
import {
    interpolate,
    Sequence,
    Series,
    useCurrentFrame,
    useVideoConfig,
    getInputProps,
    random,
    Audio, 
    Video,
    staticFile,
    AbsoluteFill,
    delayRender,
    continueRender
} from 'remotion';
import axios from 'axios';
import { getVideoMetadata } from "@remotion/media-utils";

import { Title } from './Podcast/Title';
import { Background } from './Podcast/Background';
import { Character } from './Podcast/Character';
import { AudioWaveform } from './Podcast/AudioWaveform';
import { VideoSegment } from './Podcast/VideoSegment';
import { Transition } from './Podcast/Transition';
import { Logo } from './Podcast/Logo';
import { Intro } from './Podcast/Intro';
import { Wrapper } from './Wrappers/index';
import InterfaceJsonContent from '../../src/models/InterfaceJsonContent';
import audio1 from '../../assets/voice-test.mp3';
import background from '../../assets/teacher_green.mp4';
import videoIntro from '../../assets/intro_green.mp4';
import videoOutro from '../../assets/outro_green.mp4';
import introBackground from '../../assets/intro_background.jpg';

const { withoutIntro } = getInputProps();


export const Main: React.FC<{
    content: InterfaceJsonContent
}> = ({ content: { renderData,renderSentences,  date, title, youtube } }) => {
    console.log('Main Content received >>>>>',renderData, date, title, youtube );
    if (!renderData) {
        throw new Error('Missing renderData');
    }
    const [handle] = useState(() => delayRender());
    const [videoDurationIntro, setDurationIntro] = useState(1);
    const [videoDurationOutro, setDurationOutro] = useState(1);
    const [videoDuration, setDuration] = useState(1);
    const [transcription, setTranscription] = useState('');

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const AUDIO_FILE_PATH = '/workspaces/automation-engine-aiu/assets/audio1.mp3';
    const MODEL = 'whisper-1';
    

    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const transitionDurationInFrames = 2.9 * fps;
    const showWrapperOnIndex =
        renderData.length > 2
            ? Math.floor(random(title) * (renderData.length - 2 - 2) + 2) //Valor randomico entre 2 e (quantidade de noticias - final - ultima noticia)
            : -1; //If have less then 2 news will not show wrapper

    let initialFrame = 70;
    let nextInitialFrame = initialFrame;
    

    useEffect(() => {
        getVideoMetadata(background)
          .then(({ durationInSeconds }) => {
            setDuration(Math.round(durationInSeconds * 30));
            continueRender(handle);
          }) .catch((err) => {
            console.log(`Error fetching metadata: ${err}`);
          });
    }, [handle]);

    useEffect(() => {
        getVideoMetadata(videoIntro)
          .then(({ durationInSeconds }) => {
            setDurationIntro(Math.round(durationInSeconds * 30));
            continueRender(handle);
          }) .catch((err) => {
            console.log(`Error fetching metadata: ${err}`);
          });
    }, [handle]);

    useEffect(() => {
        getVideoMetadata(videoOutro)
          .then(({ durationInSeconds }) => {
            setDurationOutro(Math.round(durationInSeconds * 30));
            continueRender(handle);
          }) .catch((err) => {
            console.log(`Error fetching metadata: ${err}`);
          });
    }, [handle]);

      

    const opacity = interpolate(
        frame,
        [durationInFrames - 30, durationInFrames - 10],
        [1, 0],
        {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        },
    );

    const opacityIntro = interpolate(
		frame,
        [0, 10, nextInitialFrame - 20, nextInitialFrame],
        [0, 1, 1, 0],
		{
				extrapolateLeft: 'clamp',
				extrapolateRight: 'extend',
		},
	);

    const opacityBackground = interpolate(
		frame,
        [nextInitialFrame - 20, nextInitialFrame],
        [ 1, 0],
		{
				extrapolateRight: 'extend',
		},
	);

    /*const backgroundColor = interpolate(
        frame,
        [0, nextInitialFrame],
        //@ts-ignore 
        ['#000000', '#2193b0']
      );*/

    

    return (
        <div style={{flex: 1,}} >
            <Series>
                <Series.Sequence durationInFrames={videoDurationIntro}>
                    <VideoSegment src={videoIntro}/>
                </Series.Sequence>
                <Series.Sequence durationInFrames={videoDuration}>
                    <Background data={renderSentences}/>
                    <Character data={renderSentences} src={videoIntro}/>
                    <Title data={renderData} />
                    <Audio src={audio1}  />
                </Series.Sequence>
                <Series.Sequence durationInFrames={videoDurationOutro}>
                    <VideoSegment src={videoOutro}/>
                </Series.Sequence>
            </Series>
        </div>
    );
};
