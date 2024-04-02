import fs from 'fs';
import path from 'path';

import { log } from '../utils/log';
import { getPath } from '../config/defaultPaths';
import InterfaceJsonContent from '../models/InterfaceJsonContent';

export default class ExportDataService {
    private content: InterfaceJsonContent;

    constructor(content: InterfaceJsonContent) {
        this.content = content;
    }

    public async execute(filename?: string, isLocalFile?:boolean) {
        const dataFilename = filename || `${this.content.timestamp}.json`;

        log(`Exporting data to ${dataFilename}`, 'ExportDataService');

        fs.writeFileSync(
            path.resolve(await getPath(isLocalFile ? 'public':'content'), dataFilename),
            JSON.stringify(this.content, null, 4),
        );
    }
}
