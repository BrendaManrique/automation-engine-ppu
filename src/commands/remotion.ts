import { Command, Flags } from '@oclif/core';
import { GetContentService } from '../services';
import shell from 'shelljs';

export default class Remotion extends Command {
    static description = 'Remotion framework related commands';

    static examples = [
        '<%= config.bin %> <%= command.id %> upgrade',
        '<%= config.bin %> <%= command.id %> preview',
        '<%= config.bin %> <%= command.id %> render-video',
        '<%= config.bin %> <%= command.id %> render-demo',
        '<%= config.bin %> <%= command.id %> render-thumb-example',
    ];

    static flags = {
        filename: Flags.string({
            char: 'f',
            description: 'filename with content',
        }),
    }

    static args = [
        {
            name: 'command',
            required: true,
            description: 'Command to run',
            options: ['upgrade', 'preview', 'render-video', 'render-demo', 'render-thumb-example'],
        },
    ];

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(Remotion);
        let metadata = {};
        let props = {};

        //Render demo will get props directly from json file.
        if(args.command != 'render-demo' ){
            metadata = await new GetContentService().execute(flags.filename)['metadata'];
            if (!metadata || !metadata['content']['renderData']) {
                throw new Error('Content not found');
            }
            
            const durationInFrames = Math.round(this.getFullDuration(metadata['content']['renderData']) * metadata['fps'])

            props = {
                metadata,
                destination: 'youtube',
                durationInFrames,
            }
        }

        let command = '';

        switch (args.command) {
            case 'upgrade':
                command = 'yarn remotion upgrade';
                break;
            case 'preview':
                command = `yarn remotion preview video/src/index.js --props='${JSON.stringify(props)}'`;
                break;
            case 'render-video':
                command = `yarn remotion render video/src/index.js Main out.mp4 --props='${JSON.stringify(props)}'`;
                break;
            case 'render-demo':
                command = `yarn remotion render video/src/index.js Main out/video.mp4 --props=./content/demo-data.json`;
                break;
            case 'render-thumb-example':
                command = `yarn remotion still video/src/index.js Thumbnail thumb.png --props='${JSON.stringify(props)}'`;
                break;
        }

        shell.exec(command);
    }

    private getFullDuration(renderData: {
        duration: number;
    }[]): number {
        const transitionDurationInSeconds = 2.9;
        
        return renderData.reduce(
            (accumulator, currentValue, index) => {
                if (
                    !renderData ||
                    index !== renderData.length - 1
                ) {
                    return (
                        accumulator +
                        currentValue.duration +
                        transitionDurationInSeconds
                    );
                }

                return accumulator + currentValue.duration;
            },
            0,
        );
    }
}
