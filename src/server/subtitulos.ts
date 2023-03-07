import express, { Router } from "express";
import axios, { AxiosRequestConfig } from "axios";
import iconv from "iconv-lite";

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
    const subtitulos = await getSubtitulos(chunks);

    res.setHeader("Content-Type", "text/srt;charset=UTF-8",);

    res.setHeader("Content-Disposition", `attachment; filename="subtitulos.srt"`)

    res.write(subtitulos);

    res.end();
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