import express, { Router } from "express";
import axios, { AxiosRequestConfig } from "axios";
import iconv from "iconv-lite";
import NodeCache from "node-cache";

const subtitulosCache = new NodeCache({ stdTTL: 60 * 60 * 24, checkperiod: 60 * 60 * 24 });

const router = Router();

function getPHPSessionID() {
    //TODO
    return "24njkpf9esn2r6ndfse65rufm7";
}

async function getSubtitulos(chunks: string[]) : Promise<string> {
    const cookiePHPSessionID = getPHPSessionID();

    const url = (chunks.length === 3) ? `https://www.tusubtitulo.com/updated/${chunks[0]}/${chunks[1]}/${chunks[2]}` :  `https://www.tusubtitulo.com/original/${chunks[0]}/${chunks[1]}`;

    const options: AxiosRequestConfig = {
        method: 'GET',
        url: url,
        withCredentials: true,
        responseType: "arraybuffer",
        headers: {
            'Accept-Encoding': 'application/json. text/srt, text/plain, */*',
            'Cookie': `PHPSESSID=${cookiePHPSessionID}`,
            'Referer': 'https://www.tusubtitulo.com/',
        },
    }

    const response = await axios.request(options);

    const data =  iconv.decode(response.data, 'win1252');

    return data;
}


async function procesarRequestSubtitulos(chunks: string[], req: express.Request, res: express.Response) : Promise<void> {
    
    res.setHeader("Content-Type", "text/srt;charset=UTF-8",);

    res.setHeader("Content-Disposition", `attachment; filename="subtitulos.srt"`);

    const subtitulos: string | undefined = subtitulosCache.get(chunks.join("-"));

    if(subtitulos) {
        console.log("Cache hit for: " + chunks.join("-"));
        res.write(subtitulos);
        res.end();
        return;
    }


    const subtitulosNuevos = await getSubtitulos(chunks);

    res.write(subtitulosNuevos);

    res.end();

    subtitulosCache.set(chunks.join("-"), subtitulosNuevos);
}

router.get("/updated/:chunk0/:chunk1/:chunk2", async (req: express.Request, res: express.Response) : Promise<void> => {
    const chunks = [req.params.chunk0, req.params.chunk1, req.params.chunk2];
    return procesarRequestSubtitulos(chunks, req, res);
});

router.get("/original/:chunk0/:chunk1", async (req: express.Request, res: express.Response) : Promise<void> => {
    const chunks = [req.params.chunk0, req.params.chunk1];
    return procesarRequestSubtitulos(chunks, req, res);
});

export default router;