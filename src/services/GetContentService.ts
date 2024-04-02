import fs from 'fs';
import path from 'path';

import { error, log } from '../utils/log';
import { getLatestFileCreated } from '../utils/getFiles';
import { getPath } from '../config/defaultPaths';
import InterfaceJsonContent from '../models/InterfaceJsonContent';
import InterfaceJsonMetadata from '../models/InterfaceJsonMetadata';
import format from '../config/format';

export default class GetContentService {
    // eslint-disable-next-line
    public async execute(filename?: string, isLocalFile?:boolean, videoFormat?: 'portrait' | 'landscape' | 'square'): Promise<{ metadata: InterfaceJsonMetadata, file: string }> {
        const contentPath = await getPath(isLocalFile ? 'public':'content');

        const contentFilePath = filename
            ? path.resolve(contentPath, filename)
            : await getLatestFileCreated('json', contentPath);

        log(`Getting content from ${contentFilePath}`, 'GetContentService');

        try {
            const content = fs.readFileSync(contentFilePath, {
                encoding: 'utf-8',
            });

            const jsonMetadata = JSON.parse(content) as InterfaceJsonMetadata;

            if (videoFormat) {
                jsonMetadata.width = format[videoFormat].width;
                jsonMetadata.height = format[videoFormat].height;
            }
        return { metadata: jsonMetadata, file: contentFilePath };
        } catch {
            error(`${contentFilePath} not found`, 'GetContentService');
            process.exit(1);
        }
    }
}
