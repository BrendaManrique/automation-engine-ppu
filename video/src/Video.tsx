import { useEffect, useState } from 'react';
import {
    Composition,
    delayRender,
    continueRender,
    getInputProps,
} from 'remotion';
import { Main } from './Main';
import { Thumbnail } from './Thumbnail';

import { log, error } from '../../src/utils/log';
import '../../assets/fonts.css';
import InterfaceJsonMetadata from 'models/InterfaceJsonMetadata';
import InterfaceJsonContent from 'models/InterfaceJsonContent';

const { 
    content, 
    durationInFrames, fps,width,height, date
 } = getInputProps() as { 
    content: InterfaceJsonContent,
    durationInFrames: number, fps:number,width:number,height:number, date:string
 }

export const RemotionVideo: React.FC = () => {
    
    log(`Metadata ${content}`, 'RenderVideoService');
        
    if ( !content || !content['renderData'] || !durationInFrames) {
        //@ts-ignore
        throw new Error(`Missing information. Content: ${!!content}, renderData: ${!!content.renderData}, durationInFrames: ${!!durationInFrames}`);
    }

    return (
        <>
            <Composition
                id="Main"
                component={Main}
                durationInFrames={durationInFrames}
                fps={fps}
                width={width}
                height={height}
                defaultProps={{
                    content
                }}
            />
            <Composition
                id="Thumbnail"
                component={Thumbnail}
                durationInFrames={1}
                fps={fps}
                width={width}
                height={height}
                defaultProps={{
                    title: content.title,
                    date: date,
                }}
            />
        </>
    );
};
