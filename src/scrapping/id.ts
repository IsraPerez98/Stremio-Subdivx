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

function limpiarTitulo(titulo: string) : string {
    let tituloNuevo = titulo.toLowerCase();

    tituloNuevo = tituloNuevo.replace(/\(\d+\)/, "") // eliminar el año

    tituloNuevo = tituloNuevo.trim(); // eliminar espacios al inicio y al final

    return tituloNuevo;
}

async function obtenerIndice() : Promise<Indice[]> {
    const urlSeries = "https://www.tusubtitulo.com/series.php?/";

    const requestSeries = await axios.get(urlSeries);

    const $ = cheerio.load(requestSeries.data);

    //console.log($.html());

    const mainTable = $('div#content > div#showindex > table');

    let indice: Indice[] = [];

    $(mainTable).find('tr > td.line0').each((index, element) => {
        let titulo = $(element).find('a').text();
        titulo = limpiarTitulo(titulo);

        const url = $(element).find('a').attr('href');

        const id = Number(url?.split("/").pop()) || null;

        indiceCache.set(titulo, id);

        indice.push({
            titulo,
            id
        });
    });

    return indice;
}

export async function obtenerIDTuSubtitulo(titulos: Titulos) : Promise<number | null> {

    const english = limpiarTitulo(titulos.english);

    const id: number | undefined = indiceCache.get(english);

    if(id) {
        console.log(`Cache hit: ${titulos.english} -> ${id}`);
        return id;
    }

    const indice = await obtenerIndice();
    /*
    const spanish_mx = titulos.spanish_mx.toLowerCase();
    const spanish_es = titulos.spanish_es.toLowerCase();
    */

    const idNuevo = indice.find((element) => {
        const titulo = element.titulo;

        //return (titulo === english || titulo === spanish_mx || titulo === spanish_es);
        return (titulo === english);
    });

    indiceCache.set(english, idNuevo?.id || null);

    return idNuevo?.id || null;
}