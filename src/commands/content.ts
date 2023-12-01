import { Command, Args } from '@oclif/core';

import {
    CreateContentTemplateService,
    MailToJsonService,
    ValidatesContentService,
} from '../services';

export default class Content extends Command {
    static description = 'Generate or validate content file';

    static examples = [
        '<%= config.bin %> <%= command.id %> mail',
        '<%= config.bin %> <%= command.id %> template [DESCRIPTION]',
        '<%= config.bin %> <%= command.id %> validate',
    ];

    static args = {
        command: Args.string({description: 'Command to run', required: true,
        options:['mail', 'template', 'validate']}),
        description: Args.string({description: 'Description of the template', required: false})
    }

    public async run(): Promise<void> {
        const { args } = await this.parse(Content);

        switch (args.command) {
            case 'mail':
                await new MailToJsonService().execute();
                break;
            case 'template':
                const { description } = args;
                if (!description) throw new Error('Missing description');

                await new CreateContentTemplateService().execute(description);
                break;
            case 'validate':
                await new ValidatesContentService().execute();
                break;
        }

        this.config
    }
}
