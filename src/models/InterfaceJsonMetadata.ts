import InterfaceJsonContent from "./InterfaceJsonContent";

export default interface InterfaceJsonMetadata {
    content: InterfaceJsonContent,
    durationInFrames?: number,
    destination?:string
    width: number;
    height: number;
    fps: number;
    timestamp: number;
    date: string;
}