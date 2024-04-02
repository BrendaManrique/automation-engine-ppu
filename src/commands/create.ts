import { Command, Flags } from '@oclif/core';

import { CreateConfig } from '../types';

import {
    BundleVideoService,
    CreateThumbnailService,
    ExportDataService,
    GetContentService,
    GetYoutubeInfoService,
    InstagramUploadService,
    RenderVideoService,
    TextToSpeechService,
    YoutubeUploadService,
    ContentProcessService,
} from '../services';
import { getLatestFileCreated } from '../utils/getFiles';
import { log } from 'console';
import fs from 'fs';

export default class Create extends Command {
    static description = 'Create video and upload to destination';

    static examples = [
        '<%= config.bin %> <%= command.id %> youtube -u -t',
        '<%= config.bin %> <%= command.id %> youtube -f demo-content.json -u -t'];

    static flags = {
        filename: Flags.string({
            char: 'f',
            description: 'filename with content',
        }),
        needTTS: Flags.boolean({
            char: 't',
            description:
                "need to create TTS. If you haven't created TTS separately (with option tts), you can set this flag to create along the creation of video",
        }),
        upload: Flags.boolean({
            char: 'u',
            description:
                'should upload result to destination (only works to YouTube and Instagram)',
        }),
        onlyUpload: Flags.boolean({
            description:
                'Only upload result to destination (only works to YouTube and Instagram). Your video should be created separately, placed on tmp folder and be the last file created on it.',
        }),
    };

    static args = [
        {
            name: 'option',
            required: true,
            description: 'Format to create content',
            options: ['youtube', 'instagram', 'tts'],
        },
    ];

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(Create);

        const { filename, needTTS, upload, onlyUpload } = flags;

        switch (args.option) {
            case 'tts':
                await tts({ filename });
                break;
            case 'youtube':
                await youtube({ filename, needTTS, upload, onlyUpload });
                break;
            case 'instagram':
                await instagram({ filename, needTTS, upload, onlyUpload });
                break;
        }
    }
}

const tts = async ({ filename }: CreateConfig) => {
    /*const { content, file } = await new GetContentService().execute(filename);

    const contentWithAudio = await new TextToSpeechService(content).execute({
        synthesizeIntro: true,
        synthesizeEnd: true,
    });

    const contentProcessed = await new ContentProcessService(content).execute({
        content: contentWithAudio
    });
    await new ExportDataService(contentProcessed).execute(file);*/
};

const youtube = async ({
    filename,
    needTTS,
    onlyUpload,
    upload,
}: CreateConfig) => {
    let { metadata, file } = await new GetContentService().execute(filename, 'portrait');
    let content = metadata.content;

    // Read Props
    //-----------------
    //const rawData = fs.readFileSync('./props.json');
    //const data = JSON.parse(rawData.toString());
    //const content = data.content;
    //------------------

    if (!onlyUpload) {
        if (needTTS) {
            const contentTts = await new TextToSpeechService(content).execute({
                synthesizeIntro: true,
                synthesizeEnd: true,
            })
            //content = await new ContentProcessService(contentTts).execute({
            //    content
            //}, 'portrait');
        }

        //Retrieves YT token
        //content = await new GetYoutubeInfoService(content).execute();

        // Store Props
        //-----------------
        //data.content = content;
        // Write the modified data back to the file
        //fs.writeFileSync('./props.json', JSON.stringify(data));
        //------------------

        const bundle = await new BundleVideoService().execute();

        metadata.durationInFrames = await new RenderVideoService(metadata).execute(
            bundle,
            'portrait',
            true,
            'youtube',
        );

        await new CreateThumbnailService(metadata).execute(bundle);
    }

    if (upload || onlyUpload) {
        const videoPath = await getLatestFileCreated('mp4');
        const thumbnailPath = await getLatestFileCreated('jpeg');

        //TODO
         await new YoutubeUploadService(content).execute(
             videoPath,
             thumbnailPath,
         );
    }

    await new ExportDataService(metadata).execute(file );
};

const instagram = async ({
    filename,
    needTTS,
    onlyUpload,
    upload,
}: CreateConfig) => {
    let { metadata, file } = await new GetContentService().execute(filename,'portrait');
    let content = metadata.content;

    if (!onlyUpload) {
        if (needTTS) {
            content = await new TextToSpeechService(content).execute({
                synthesizeIntro: false,
                synthesizeEnd: false,
            });
            content = await new ContentProcessService(content).execute({
                content
            }, 'portrait');
        }

        const bundle = await new BundleVideoService().execute();

        await new RenderVideoService(metadata).execute(
            bundle,
            'portrait',
            false,
            'instagram',
        );

        await new CreateThumbnailService(metadata).execute(bundle);
    }

    if (upload || onlyUpload) {
        const videoPath = await getLatestFileCreated('mp4');
        const thumbnailPath = await getLatestFileCreated('jpeg');

        await new InstagramUploadService(content).execute(
            videoPath,
            thumbnailPath,
        );
    }

    await new ExportDataService(content).execute(file);
};
