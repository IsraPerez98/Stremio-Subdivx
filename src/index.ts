import stremioSDK from "stremio-addon-sdk";
const { addonBuilder, serveHTTP } = stremioSDK;

import type {ContentType, Subtitle, Manifest} from "stremio-addon-sdk";

import { ObtenerTitulos } from "./metadata";

const manifest : Manifest = {
    id: "org.example.hello-world",
    version: "1.0.0",
    name: "Hello World",
    description: "Hello World Addon",
    resources: ["subtitles"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: [],
};

const builder = new addonBuilder(manifest);


builder.defineSubtitlesHandler(function(args: {
    type: ContentType;
    id: string;
    extra: {
        /**
        * OpenSubtitles file hash for the video.
        */
        videoHash: string;
        /**
        * Size of the video file in bytes.
        */
        videoSize: string;
    };
}): Promise<{ subtitles: Subtitle[] }> {

    console.log({args})

    ObtenerTitulos(args.type, args.id);
    
    const subtitle = {
        url: 'https://mkvtoolnix.download/samples/vsshort-en.srt',
        lang: 'TEST'
    };
    
    return Promise.resolve({ subtitles: [subtitle] });
});

serveHTTP(builder.getInterface(), { port: 7000 });