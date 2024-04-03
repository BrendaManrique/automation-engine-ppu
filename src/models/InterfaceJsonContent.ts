import Segment from "./Segments";

export default interface InterfaceJsonContent {
    contentText?: { text: string; url?: string; shortLink?: string };
    end?: { text: string; url?: string; shortLink?: string };
    news: { text: string; url?: string; shortLink?: string }[];
    message?: { text: string; url?: string; shortLink?: string };
    title: string;
    duration?: number;
    renderData?: {
        text: string;
        duration: number;
        audioFilePath: string;
        segments: Segment[]
    }[];
    renderSentences?: any;
    youtube?: {
        viewCount: string;
        subscriberCount: string;
        videoCount: string;
    }
}
