import { error, log } from '../utils/log';
import GetContentService from './GetContentService';

export default class ValidatesContentService {
    public async execute() {
        const { metadata } = await new GetContentService().execute();
        const content = metadata.content;

        const errors: string[] = [];

        if (!content.title) {
            errors.push('Title was not defined');
        }

        if (!content.news || content.news.length === 0) {
            errors.push('News was not defined');
        }

        if (errors.length) {
            error(
                `Found errors while validating \n${errors.join('\n')}`,
                'ValidatesContentService',
            );
        }

        log('Validation complete', 'ValidatesContentService');
    }
}
