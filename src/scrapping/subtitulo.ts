import axios from "axios";
import * as cheerio from 'cheerio';
import { Subtitle } from "stremio-addon-sdk";

const idiomas : {[key: string]: string[]} = { // ISO 639-2 (se añade categoria extra para separar español latino y español de España)
    'english': ['eng'],
    'english (us)': ['eng'],
    'english (uk)': ['eng'],
    'español': ['spa'],
    'español (españa)': ['spa', 'ES-es'],
    'español (latinoamérica)': ['spa', 'ES-lat'],
    'català': ['cat'],
}

function convertirRelAURL(rel: string): string {
    const chunks = rel.split(",");

    if (chunks.length === 3) {
        return `/updated/${chunks[0]}/${chunks[1]}/${chunks[2]}`;
    } else {
        return `/original/${chunks[0]}/${chunks[1]}`;
    }
}

function generarSubtitulos(url: string, idioma: string): Subtitle[] {
    const idioma_clean = idioma.toLowerCase();
    if(!(idiomas.hasOwnProperty(idioma_clean))) {
        console.log(`Lenguaje desconocido: ${idioma}`);
        return [];
    }

    const lenguajesISO: any = idiomas[idioma_clean];

    const subtitulos: Subtitle[] = [];

    for (const lenguajeISO of lenguajesISO) {
        subtitulos.push({
            url: url,
            lang: lenguajeISO,
        });
    }

    return subtitulos;
}


function extraerSubtitulos(element: cheerio.Element): Subtitle[] {
    const $ = cheerio.load(element);

    const subtitulos: Subtitle[] = [];

    const linea = $('tr');

    linea.each(function(_i: number, element: cheerio.Element) {
        const language = $(element).find('td.language').text().trim();
        if(!language) {
            return;
        }

        const noCompletado = $(element).text().match('^\d+(\.\d+)?%\s*Completado$');
        if (noCompletado) {
            console.log(`El subtitulo ${language} no esta completado`);
            return;
        }

        const btnDescarga = $(element).find('td > a.bt_descarga');

        const rel = btnDescarga.attr('rel');

        if(!rel) {
            console.log(`No se ha encontrado el atributo rel en el boton de descarga`);
            return;
        }

        console.log({rel});

        const url = convertirRelAURL(rel);

        const subtitulosGenerados = generarSubtitulos(url, language);

        subtitulos.push(...subtitulosGenerados);
    });

    return subtitulos;
}

export async function obtenerSubtitulos(idTuSubtitulo: number, temporada: number, capitulo: number): Promise<Subtitle[]> {
    const url = `https://www.tusubtitulo.com/show/${idTuSubtitulo}/${temporada}`;
    const requestSeries = await axios.get(url);

    const $ = cheerio.load(requestSeries.data);

    const episodios = $('div#content > span#episodes > table');
    
    let elementoCapitulo: cheerio.Element | null = null;

    episodios.each((_i: number, element: cheerio.Element) => {
        const titulo = $(element).find('tr > td.NewsTitle > a').text();
        const formatoCapitulo = `.*0*${temporada}x0*${capitulo}.*`;

        if (titulo.match(formatoCapitulo)) {
            console.log({titulo});
            elementoCapitulo = element;
            return false;
        }
    });

    if (!elementoCapitulo) {
        console.log(`No se ha encontrado el capitulo ${capitulo} de la temporada ${temporada} de la serie con id ${idTuSubtitulo}`);
        return [];
    }

    const subtitulos = extraerSubtitulos(elementoCapitulo);

    return subtitulos;
}