//Supported voices
//https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support?tabs=stt#prebuilt-neural-voices
/*Configure voice style:  
https://speech.microsoft.com/audiocontentcreation */
import {
    SpeechSynthesisOutputFormat,
    SpeechConfig,
    AudioConfig,
    SpeechSynthesizer,
    SpeechSynthesisBoundaryType,
} from 'microsoft-cognitiveservices-speech-sdk';
import path from 'path';
import OpenAI from 'openai';
import fs from 'fs';
import axios, { AxiosResponse } from 'axios';

import { error, log } from '../utils/log';
import { getPath } from '../config/defaultPaths';
import InterfaceJsonContent from '../models/InterfaceJsonContent';
import Segment from '../models/Segments';
//import  propsPreview from './props.json';

class TextToSpeechService {
    private voices = [
        //{ chance: 3, name: 'en-US-AmberNeural' },
        //{ chance: 3, name: 'en-US-AnaNeural' },
        { chance: 1, name: 'en-US-AriaNeural' },
        //{ chance: 1, name: 'en-US-BrandonNeural' },
        //{ chance: 1, name: 'en-US-ChristopherNeural' },
        //{ chance: 1, name: 'en-US-CoraNeural' },
        //{ chance: 3, name: 'en-US-DavisNeural' },
        //{ chance: 3, name: 'en-US-ElizabethNeural' },
        //{ chance: 1, name: 'en-US-GuyNeural' },
        //{ chance: 3, name: 'en-US-JacobNeural' },
        { chance: 3, name: 'en-US-JasonNeural' },
        { chance: 0, name: 'en-US-JennyNeural' },
        { chance: 0, name: 'en-US-NancyNeural' },
        //{ chance: 1, name: 'en-US-SaraNeural' },
        //{ chance: 1, name: 'en-US-TonyNeural' }, //Nancy, Aria, Davis, Jenny
    ];
    private azureKey: string;
    private azureRegion: string;
    private voice: string;
    private content: InterfaceJsonContent;

    constructor(content: InterfaceJsonContent) {
        log(`${JSON.stringify(content)}`, 'InitialContent');
        this.content = content;

        if (!process.env.AZURE_TTS_KEY) {
            error('Azure Key is not defined', 'TextToSpeechService');
            return;
        }

        if (!process.env.AZURE_TTS_REGION) {
            error('Azure Region is not defined', 'TextToSpeechService');
            return;
        }

        this.azureKey = process.env.AZURE_TTS_KEY;
        this.azureRegion = process.env.AZURE_TTS_REGION;
        this.content.renderData = [];
    }

    public async execute(): Promise<InterfaceJsonContent> {
        await this.synthesizeMicrosoft()
        //await this.synthesizeOpenAI()


        //Old code------------------------
        /*const synthesizePromises: Promise<void>[] = [];
        if (synthesizeIntro) {
            synthesizePromises.push(this.synthesizeIntro());
        }
        synthesizePromises.push(this.synthesizeNews());
        await Promise.all(synthesizePromises);
        if (synthesizeEnd) {
            await this.synthesizeEnd()
        }*/

        //log(`${JSON.stringify(this.content)}`, 'TextToSpeechService');
        return this.content;
    }

    private async synthesizeOpenAI(): Promise<void> {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
          });

        const tmpPath = await getPath('assets');
        const audioFilePath = path.resolve(tmpPath, 'voice-test.mp3');
        let segments = [];
        let text = '';
        log(`Audio file path: ${audioFilePath}`, 'TextToSpeechService');

        //const transcribeAudio = async (fileName) => {
            try {
              //const response = await axios.get('http://127.0.0.1:8000/transcribe',  { params: { fileName: 'voice-test.mp3'},
              //headers: {'Access-Control-Allow-Origin': '*', 'X-Requested-With': 'XMLHttpRequest'}});
              
              const contentPath = await getPath('assets');
              const response = require(`${contentPath}/datatest.json`);
              log(`Reading Segments: ${JSON.stringify(response)}`, 'TextToSpeechService');
              //@ts-ignore
              //segments = response.data.message.segments; 
              segments = response.message.segments; 
              //@ts-ignore
              //text = response.data.message.text; 
              text = response.message.text; 
            } catch (error) {
              console.error('Error transcribing audio:', error);
            }
          //};

          //transcribeAudio('voice-test.mp3');

        if (typeof this.content.renderData !== 'object') {
            error('Render data is not defined', 'TextToSeechService');
            throw new Error('Render data is not defined');
        }

        log('Synthesizing Whisper', 'TextToSpeechService');
        /*const { audioFilePath, segments, duration } = await this.synthesize(
            this.content.end.text,
            'end',
        );*/

        //propsPreview.content = this.content;
        this.content.renderData.push({
            text,
            duration:19596,
            audioFilePath,
            segments
        });  
    }

    private async synthesizeMicrosoft(): Promise<void> {
        if (!this.content.contentText?.text) {
            log('ContentText text is not defined, skipping...', 'TextToSeechService');
            return;
        }

        if (typeof this.content.renderData !== 'object') {
            error('Render data is not defined', 'TextToSeechService');
            throw new Error('Render data is not defined');
        }

        log(`Synthesizing ContentText`, 'TextToSpeechService');
        const { audioFilePath, segments, duration } = await this.synthesize(
            this.content.contentText.text,
            'contentText',
        );

        this.content.renderData[0] = {
            text: this.content.contentText.text,
            duration,
            audioFilePath,
            segments,
        }
    }

    private async synthesizeNews(): Promise<void> {
        const synthesizePromises = this.content.news.map(async (news, index) => {
            log(`Synthesizing news ${index}`, 'TextToSpeechService');

            const { audioFilePath, segments, duration } = await this.synthesize(
                news.text,
                index.toString(),
            );

            if (typeof this.content.renderData !== 'object') {
                error('Render data is not defined', 'TextToSeechService');
                throw new Error('Render data is not defined');
            }

            this.content.renderData[index + 1] = {
                text: news.text,
                duration,
                audioFilePath,
                segments,
            }
        });

        await Promise.all(synthesizePromises);
    }

    private async synthesizeEnd(): Promise<void> {
        if (!this.content.end?.text) {
            log('End text is not defined, skipping...', 'TextToSeechService');
            return;
        }

        if (typeof this.content.renderData !== 'object') {
            error('Render data is not defined', 'TextToSeechService');
            throw new Error('Render data is not defined');
        }

        log('Synthesizing end', 'TextToSpeechService');
        const { audioFilePath, segments, duration } = await this.synthesize(
            this.content.end.text,
            'end',
        );

        this.content.renderData.push({
            text: this.content.end.text,
            duration,
            audioFilePath,
            segments
        });
    }

    private getVoice() {
        const voicesExtended = this.voices.reduce(
            (acc, voice) => [...acc, ...Array(voice.chance).fill(voice.name)],
            [] as string[],
        );

        if (!this.voice) {
            this.voice =
                voicesExtended[Math.floor(Math.random() * voicesExtended.length)];
        } /*else {
            let newVoice = voicesExtended[Math.floor(Math.random() * voicesExtended.length)];

            while (newVoice === this.voice) {
                newVoice = voicesExtended[Math.floor(Math.random() * voicesExtended.length)];
            }

            this.voice = newVoice;
        }*/

        return this.voice;
    }

    private getSingleVoice() {
        return 'en-US-JasonNeural';
    }

    private async synthesize(text: string, sufix: string): Promise<{ audioFilePath: string, duration: number, segments: Segment[] }> {
        const tmpPath = await getPath('tmp');
        const segments: Segment[] = []

        return new Promise(resolve => {
            const audioFilePath = path.resolve(tmpPath, `output-${sufix}.mp3`);

            const speechConfig = SpeechConfig.fromSubscription(
                this.azureKey,
                this.azureRegion,
            );

            speechConfig.speechSynthesisOutputFormat =
                SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3;
            const audioConfig = AudioConfig.fromAudioFileOutput(audioFilePath);


            const ssml = `
                <speak version="1.0" xml:lang="pt-BR">
                    <voice name="${this.getSingleVoice()}">
                        <break time="250ms" /> ${text}
                    </voice>
                </speak>`;
                /*<speak version="1.0" xml:lang="en-US" xmlns:mstts="http://www.w3.org/2001/mstts">
                    <voice name="${this.getSingleVoice()}">
                        <mstts:express-as style="whispering">
                            <prosody rate="-22.00%">
                                ${text}
                            </prosody>
                        </mstts:express-as>
                    </voice>
                </speak>`;*/
            //<mstts:express-as style="whispering">
            //</mstts:express-as>
            //<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US"><voice name="en-US-JasonNeural"><s /><mstts:express-as style="whispering">This is a new text"</mstts:express-as></voice><voice name="en-US-AriaNeural"><mstts:express-as style="whispering">That’s remarkable! You’re a genius!"Mom said to her son.</mstts:express-as><s />

            const synthesizer = new SpeechSynthesizer(
                speechConfig,
                audioConfig,
            );

            synthesizer.wordBoundary = (s, e) => {
                if (SpeechSynthesisBoundaryType.Word === e.boundaryType) {
                    const originalText = ssml.substring(e.textOffset - 1, e.textOffset + e.wordLength + 1).trim(); // +1 to include the punctuation
                    
                    segments.push({
                        start: e.audioOffset / 10000,
                        end: (e.audioOffset + e.duration) / 10000,
                        word: originalText,
                    })
                }
            }

            synthesizer.speakSsmlAsync(
                ssml,
                result => {
                    synthesizer.close();
                    resolve({
                        audioFilePath,
                        duration: result.audioDuration / 10000000, // 100 nanoseconds for each audio duration unit -> to seconds
                        segments
                    });
                },
                err => {
                    synthesizer.close();
                    error(
                        `Synthesize of sentence ${sufix} failed. \n ${err}`,
                        'TextToSpeechService',
                    );
                },
            );
        });
    }
}

export default TextToSpeechService;
