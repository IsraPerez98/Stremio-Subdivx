import stremioSDK from "stremio-addon-sdk";
const { addonBuilder, serveHTTP } = stremioSDK;

import type {ContentType, Subtitle, Manifest} from "stremio-addon-sdk";

import { ObtenerTitulos } from "./metadata";
import { obtenerIDTuSubtitulo } from "./scrapping/id";
import { obtenerSubtitulos } from "./scrapping/subtitulo";

const manifest : Manifest = {
    id: "org.example.hello-world",
    version: "1.0.0",
    name: "Hello World",
    description: "Hello World Addon",
    resources: ["subtitles"],
    types: ["series"],
    idPrefixes: ["tt"],
    catalogs: [],
};

const builder = new addonBuilder(manifest);


builder.defineSubtitlesHandler(async function(args: {
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

    if (args.type !== "series") {
        return Promise.resolve({ subtitles: [] });
    }

    console.log({args})

    const titulos = await ObtenerTitulos(args.type, args.id);

    console.log({titulos});

    const idTuSubtitulo = await obtenerIDTuSubtitulo(titulos);

    console.log({idTuSubtitulo});

    if (idTuSubtitulo === null) {
        console.log(`${titulos.english} no tiene subtitulos en tuSubtitulo}`);
        return Promise.resolve({ subtitles: [] });
    }

    const temporada = Number(args.id.split(":")[1]);
    const capitulo = Number(args.id.split(":")[2]);

    const subtitulos: Subtitle[] = await obtenerSubtitulos(idTuSubtitulo, temporada, capitulo);

    console.log({subtitulos});
    
    return Promise.resolve({ subtitles: subtitulos });
});

serveHTTP(builder.getInterface(), { port: 7000 });