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
import fs from 'fs';
import axios, { AxiosResponse } from 'axios';
import fetch, {Headers} from 'node-fetch'
import { createClient } from 'pexels';
import OpenAI from 'openai';

import { error, log } from '../utils/log';
import { getPath } from '../config/defaultPaths';
import InterfaceJsonContent from '../models/InterfaceJsonContent';
import Segment from '../models/Segments';
import { AnyCnameRecord } from 'dns';

interface SentenceSegment {
    text: string;
    segment: Segment;
  }

class ContentProcessService {
    private openAIKey: string;
    private content: InterfaceJsonContent;
    private videoFormat?: string;
    private configuration:any
    private openai: any;
    private sentences: any;
    private pexelsClient: any;

    constructor(content: InterfaceJsonContent) {
        this.content = content;
        this.sentences = [];
        this.openai = new OpenAI({
            organization: process.env.OPENAI_API_ORG,
            apiKey: process.env.OPENAI_API_KEY,
        });
        
        if (!process.env.OPENAI_API_KEY) {
            error('OpenAI Key is not defined', 'ContentProcessService');
            return;
        }

        this.openAIKey = process.env.OPENAI_API_KEY;
        this.openai = new OpenAI(this.configuration);
        //@ts-ignore
        this.pexelsClient = createClient(process.env.PEXELS_API_KEY);
    }

    public async execute({
        content,
    }: {
        content?: InterfaceJsonContent;
    }, videoFormat?: 'portrait' | 'landscape' | 'square'): Promise<InterfaceJsonContent> {
        log(`${JSON.stringify(this.content)}`, 'ContentProcessService-InitialContent');
        this.videoFormat = videoFormat ||  'portrait';
        this.processSentences();
        await this.processWithOpenAI();
        await this.processWithPexels();
        return this.content;
    }

    private processSentences(){
        if(!this.content.renderData) return;
        const data = this.content.renderData[0];
        
        // Remove any potential empty strings generated by the split
        this.sentences = data.text.split('.').map(sentence => sentence.trim()+'.').filter(sentence => sentence !== "");
        
         // Create a unified list of text chunks (either a sentence or a segment), each with its position in the full text
        let textChunks = [];
        this.sentences.forEach(sentence => {
            //@ts-ignore
            textChunks.push({text: sentence, position: data.text.indexOf(sentence), type: 'sentence'});
        });
        //@ts-ignore
        data.segments.forEach(segment => {
            //@ts-ignore
            textChunks.push({text: segment.text.trim(), position: data.text.indexOf(segment.text.trim()), type: 'segment',start: segment.start, end: segment.end});
        });

        // Sort the text chunks by their position in the full text
        //@ts-ignore
        textChunks.sort((a, b) => a.position - b.position);

        // Iterate over the sorted text chunks, accumulating segments for each sentence
        let currentSentenceSegments = [];
        let renderSentences = [];
        textChunks.forEach(chunk => {
            //@ts-ignore
            if (chunk.type === 'sentence') {
                if (currentSentenceSegments.length > 0) {
                    /*const processedSegments = currentSentenceSegments.map(segment => {
                        return {
                            text: segment.text, 
                            start: segment.start, 
                            end: segment.end
                        }
                    });*/
                    //@ts-ignore
                    const segmentStart = currentSentenceSegments[0].start;
                    //@ts-ignore
                    const segmentEnd = currentSentenceSegments[currentSentenceSegments.length-1].end;
                    //@ts-ignore
                    renderSentences.push({
                        //@ts-ignore
                        sentence: currentSentenceSegments[0].text,
                        //@ts-ignore
                        start: segmentStart,
                        end: segmentEnd
                    });
                    currentSentenceSegments = [];
                }
            } else {
                currentSentenceSegments.push(chunk);
            }
        });

        // Add the last sentence with its segments to the result
        if (currentSentenceSegments.length > 0) {
            //@ts-ignore
            /*const processedSegments = currentSentenceSegments.map(segment => {
                return {
                    text: segment.text, 
                    start: segment.start, 
                    end: segment.end
                }
            });*/
            //@ts-ignore
            const segmentStart = currentSentenceSegments[0].start;
            //@ts-ignore
            const segmentEnd = currentSentenceSegments[currentSentenceSegments.length-1].end;
            //@ts-ignore
            renderSentences.push({
                //@ts-ignore
                sentence: currentSentenceSegments[0].text,
                start: segmentStart,
                end: segmentEnd
            });
        }
        this.content["renderSentences"] = renderSentences;
        log(`${JSON.stringify(renderSentences)}`, 'ContentProcessService-Segments');
    }

    private async processWithOpenAI(): Promise<void> {
        log('ProcessWithOpenAI', 'ContentProcessService');
       
        try {
            const userInput = this.sentences;
            const prompt = `Considering all sentences as background context. For each one of the sentences in ${JSON.stringify(userInput)}, extract at least 10 keywords into a comma separated list, extract bullet points into a comma separated list. Also, for each sentence, compose a prompt describing an imaginary scene based on the sentence. The keywords should be in present tense.  If the sentence is a transition sentence or phrase, leave the keywords empty. `;
            const schema = {
                "type": "object",
                "properties": {
                  "sentences": {
                    "type": "array",
                    "description": "List of sentences.",
                    "items": {
                        "type": "object",
                        "properties": {
                        "sentence": {
                            "type": "string",
                            "description": "each input sentence"
                        },
                        "prompt": {
                            "type": "string",
                            "description": "prompt for each sentence"
                        },
                        "keywords": {
                            "type": "string",
                            "description": "keywords that represent each sentence"
                        },
                        "bulletpoints": {
                            "type": "string",
                            "description": "Bulletpoints in the sentence"
                        }
                        }
                    }
                }
            }}
            const data = {
                model: "gpt-3.5-turbo",
                messages: [
                  { role: "system", "content": "You are a content creator." },
                  { role: "user", content: prompt }],
                functions: [{ name: "set_reel", parameters: schema }],
                function_call: {name: "set_reel"}
              }

              log(`${JSON.stringify(data)}`, 'ContentProcessService-ChatGPTCall');

            const completion = await this.openai.chat.completions.create(data);
            const generatedText = completion.data.choices[0].message.function_call.arguments;
            log(`${generatedText}`, 'ContentProcessService-ChatGPTResponse');
            
            /*--- TEST ---*/
            //const generatedText = "{\n  \"sentences\": [\n    {\n      \"sentence\": \"Welcome to the first class of entry-preneurship 101.\",\n      \"prompt\": \"Imagine a brightly lit classroom filled with eager students, ready to learn about entry-preneurship.\",\n      \"keywords\": \"Welcome, first class, entry-preneurship 101\",\n      \"bulletpoints\": \"\"\n    },\n    {\n      \"sentence\": \"I'm excited to embark on this journey with you.\",\n      \"prompt\": \"Picture a group of individuals standing on a dock, ready to board a ship called 'Entrepreneurship', filled with excitement and anticipation.\",\n      \"keywords\": \"excited, embark, journey\",\n      \"bulletpoints\": \"\"\n    },\n    {\n      \"sentence\": \"We'll be covering everything you need to know to take your ideas and turn them into successful businesses.\",\n      \"prompt\": \"Imagine a classroom whiteboard filled with diagrams and charts, symbolizing the knowledge and tools that will be shared to transform ideas into thriving businesses.\",\n      \"keywords\": \"covering, need to know, ideas, turn, successful businesses\",\n      \"bulletpoints\": \"\"\n    },\n    {\n      \"sentence\": \"So let's dive in.\",\n      \"prompt\": \"Visualize a group of divers plunging into a crystal-clear pool, ready to explore the depths of entrepreneurship.\",\n      \"keywords\": \"\",\n      \"bulletpoints\": \"\"\n    },\n    {\n      \"sentence\": \"First, let's chat about what entry-preneurship is all about.\",\n      \"prompt\": \"Imagine a casual conversation between friends in a cozy coffee shop, discussing the essence and significance of entry-preneurship.\",\n      \"keywords\": \"chat, entry-preneurship, all about\",\n      \"bulletpoints\": \"\"\n    },\n    {\n      \"sentence\": \"At its core, entrepreneurship is the process of starting, developing, and managing a business venture to make a profit.\",\n      \"prompt\": \"Picture a group of individuals building a strong foundation, brick by brick, symbolizing the essential elements of entrepreneurship: starting, developing, and managing a profitable business venture.\",\n      \"keywords\": \"core, entrepreneurship, process, starting, developing, managing, business venture, make a profit\",\n      \"bulletpoints\": \"\"\n    },\n    {\n      \"sentence\": \"Entrepreneurs are creative problem solvers who identify opportunities and turn them into successful businesses.\",\n      \"prompt\": \"Imagine a group of entrepreneurs sitting around a table, brainstorming solutions and transforming challenges into opportunities that lead to successful business ventures.\",\n      \"keywords\": \"entrepreneurs, creative problem solvers, identify opportunities, turn, successful businesses\",\n      \"bulletpoints\": \"\"\n    },\n    {\n      \"sentence\": \"They're the risk-takers and the innovators who drive our economy and shape our world.\",\n      \"prompt\": \"Visualize a group of individuals confidently stepping onto a giant roller coaster, symbolizing the entrepreneurial spirit of risk-taking and innovation that propels our economy and influences the world.\",\n      \"keywords\": \"risk-takers, innovators, drive, economy, shape, world\",\n      \"bulletpoints\": \"\"\n    },\n    {\n      \"sentence\": \"Now,.\",\n      \"prompt\": \"\",\n      \"keywords\": \"\",\n      \"bulletpoints\": \"\"\n    }\n  ]\n}";
            const gptSentences = JSON.parse(generatedText)['sentences'];
            this.content['renderSentences'].forEach((sentenceObj, idx) => {
                sentenceObj['keywords'] = gptSentences[idx]['keywords'];
                sentenceObj['bulletpoints'] = gptSentences[idx]['bulletpoints'];
                sentenceObj['prompt'] = gptSentences[idx]['prompt'];
            });

            log(`${this.content['renderSentences']}`, 'ContentProcessService-RenderData');
            
        } catch (error) {
            log(`Error processing with ChatGPT:${error}`, 'ContentProcessService');
            if (error instanceof OpenAI.APIError) {
                console.error(error.status);  // e.g. 401
                console.error(error.message); // e.g. The authentication token you passed was invalid...
                console.error(error.code);  // e.g. 'invalid_api_key'
                console.error(error.type);  // e.g. 'invalid_request_error'
              } else {
                // Non-API error
                console.log(error);
              }
        }
    }

    private async processWithPexels(): Promise<void> {
        log('processWithPexels', 'ContentProcessService');
        const tmpPath = await getPath('tmp');
            
        try {
            const renderSentences = this.content['renderSentences'];
            let idx = 0;
            //Retrieves a video for every sentence
            for (const sentenceObj of renderSentences) {
                const generatedPrompt = sentenceObj.prompt;
                
                log(`Calling Pexels API`, 'ContentProcessService');   
                const response = await this.pexelsClient.videos.search({ 
                    query:generatedPrompt, 
                    orientation:this.videoFormat, 
                    per_page: 1});
                
            
                let outputVideoPath = '';
                let pexelsUrl  = '';
                if(!!response.videos ){
                    pexelsUrl = response.videos[0].video_files[0].link;
                }
                /*if(!!response.videos ){
                    const pexelsUrl = response.videos[0].video_files[0].link;
                    //const pexelsUrl = "https://player.vimeo.com/external/516260402.hd.mp4?s=337a95a1b2fc99043000e6e07938fdf891bf7287&profile_id=172&oauth2_token_id=57447761";
                    // download and save video in a temporary directory
                    
                    outputVideoPath = path.resolve(
                        tmpPath,
                        `short_video_${idx}.mp4`,
                    );
                    const writer = fs.createWriteStream(outputVideoPath);

                    const videoResponse = await axios.get(pexelsUrl, { responseType: 'stream' });
                    videoResponse.data.pipe(writer);

                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });

                } else {
                    log(`Error retrieving videos: ${response}`, 'ContentProcessService-PexelsCall');
                }*/
                
                this.content['renderSentences'][idx]['resourceUrl'] = pexelsUrl;//`short_video_${idx}.mp4`;
                log(`Retrieved Url ${idx}: - ${outputVideoPath}`, 'ContentProcessService-PexelsCall');
                idx++;
            };
            
            //Return -> The content will be loaded inside this.content['renderSentences'].
        } catch (error) {
            log(`Error processing videos:${error}`, 'ContentProcessService-PexelsCall');
        }
    };
};

export default ContentProcessService;



// log(` processing with Stable Diffusion:${rsp}`, 'ContentProcessService');
// const mimeType = response.headers['content-type']
//const result = response.data
//const base64data = Buffer.from(result).toString('base64')
// const img = `data:${mimeType};base64,` + base64data
// return img*/
