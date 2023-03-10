import stremioSDK from "stremio-addon-sdk";
const { addonBuilder, getRouter, publishToCentral } = stremioSDK;

import express from "express";
import type {ContentType, Subtitle, Manifest} from "stremio-addon-sdk";

import config from "./config";

import { ObtenerTitulos } from "./metadata";
import { obtenerIDTuSubtitulo } from "./scrapping/id";
import { obtenerSubtitulos } from "./scrapping/subtitulo";
import subtitulosRouter from "./server/subtitulos";

const manifest : Manifest = {
    id: "com.github.IsraPerez98.Stremio-TuSubtitulo",
    version: "1.0.0",
    name: "Tu Subtitulo",
    description: "Obtiene subtitulos de series en español de españa, español latino, catalán e inglés de TuSubtitulo.com, este addon no está afiliado a TuSubtitulo.com",
    resources: ["subtitles"],
    types: ["series"],
    idPrefixes: ["tt"],
    catalogs: [],
    logo: `${config.host}/logo`,
    background: `${config.host}/logo`,
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

    subtitulos.forEach((subtitulo) => {
        const url = subtitulo.url.replace(/^\/+/g, '');
        subtitulo.url = `${config.host}/${url}`;
    });

    console.log({subtitulos});
    
    return Promise.resolve({ subtitles: subtitulos });
});

const router = getRouter(builder.getInterface());

const server = express();

server.use("/", router);

server.use("/", subtitulosRouter);

server.get('/', (req: express.Request, res: express.Response) => {
    res.redirect('/manifest.json');
});

server.get('/background', (req: express.Request, res: express.Response) => {
    res.sendFile(__dirname + '/img/background.png');
});

server.get('/logo', (req: express.Request, res: express.Response) => {
    res.sendFile(__dirname + '/img/logo.png');
});

server.listen(config.port, () => {
    console.log(`HTTP addon accessible at: ${config.host}/manifest.json`);
});