import fs from 'fs';
import path from 'path';
import { renderStill } from '@remotion/renderer';

import InterfaceJsonMetadata from '../models/InterfaceJsonMetadata';
import { log } from '../utils/log';
import { getPath } from '../config/defaultPaths';
import format from '../config/format';

export default class CreateThumbnailService {
    private metadata: InterfaceJsonMetadata;
    private compositionId = 'Thumbnail';

    constructor(metadata: InterfaceJsonMetadata) {
        this.metadata = metadata;
    }

    public async execute(bundle: string, videoFormat: 'portrait' | 'landscape' | 'square' = 'landscape'): Promise<string> {
        log(`Getting compositions from ${bundle}`, 'CreateThumbnailService');
        const content = this.metadata.content;
        const tmpPath = await getPath('tmp');

        const thumbnailPath = path.resolve(
            tmpPath,
            `${this.metadata.timestamp}.jpeg`,
        );

        log(`Starting render process`, 'CreateThumbnailService');

        await renderStill({
            serveUrl: bundle,
            output: thumbnailPath,
            inputProps: {
                content: content,
                destination: 'youtube',
                durationInFrames: 1,
            },
            composition: {
                id: this.compositionId,
                durationInFrames: 1,
                fps: this.metadata.fps,
                height: format[videoFormat].height,
                width: format[videoFormat].width,
                defaultProps:{},
                props: {}, 
                defaultCodec:'h264'
            },
            imageFormat: 'jpeg',
        });

        return thumbnailPath;
    }
}
