import axios from "axios";
import * as cheerio from 'cheerio';
import NodeCache from "node-cache";

const indiceCache = new NodeCache();

interface Titulos {
    /*
    spanish_mx: string; 
    spanish_es: string; 
    */
    english: string
}

interface Indice {
    titulo: string;
    id: number | null;
}

async function obtenerIndice() : Promise<Indice[]> {
    const urlSeries = "https://www.tusubtitulo.com/series.php?/";

    const requestSeries = await axios.get(urlSeries);

    const $ = cheerio.load(requestSeries.data);

    //console.log($.html());

    const mainTable = $('div#content > div#showindex > table');

    let indice: Indice[] = [];

    $(mainTable).find('tr > td.line0').each((index, element) => {
        const titulo = $(element).find('a').text();
        const url = $(element).find('a').attr('href');

        const id = Number(url?.split("/").pop()) || null;

        indice.push({
            titulo,
            id
        });
    });

    return indice;
}

export async function obtenerIDTuSubtitulo(titulos: Titulos) : Promise<number | null> {

    const id: number | undefined = indiceCache.get(titulos.english);

    if(id) {
        console.log(`Cache hit: ${titulos.english} -> ${id}`);
        return id;
    }

    const indice = await obtenerIndice();

    const english = titulos.english.toLowerCase();
    /*
    const spanish_mx = titulos.spanish_mx.toLowerCase();
    const spanish_es = titulos.spanish_es.toLowerCase();
    */

    const idNuevo = indice.find((element) => {
        const titulo = element.titulo.toLowerCase();

        //return (titulo === english || titulo === spanish_mx || titulo === spanish_es);
        return (titulo === english);
    });

    indiceCache.set(titulos.english, idNuevo?.id || null);

    return idNuevo?.id || null;
}