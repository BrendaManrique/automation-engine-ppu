import fs from 'fs';
import path from 'path';

import { log } from '../utils/log';
import { getPath } from '../config/defaultPaths';
import InterfaceJsonMetadata from '../models/InterfaceJsonMetadata';

export default class ExportDataService {
    private metadata: InterfaceJsonMetadata;

    constructor(metadata: InterfaceJsonMetadata) {
        this.metadata = metadata;
    }

    public async execute(filename?: string) {
        const dataFilename = filename || `${this.metadata.timestamp}-${(this.metadata.date).replace('/','')}.json`;

        log(`Exporting data to ${dataFilename}`, 'ExportDataService');

        fs.writeFileSync(
            path.resolve(await getPath('content'), dataFilename),
            JSON.stringify(this.metadata, null, 4),
        );
    }
}
