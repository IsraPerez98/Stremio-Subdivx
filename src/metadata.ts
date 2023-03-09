import axios from "axios";

import { ContentType } from "stremio-addon-sdk";

//pls don't steal
const apikey = "af3ef9949108c67d7f2bc1604ee7959d";


//export async function ObtenerTitulos(type: ContentType, meta_id: string) : Promise<{spanish_mx: string; spanish_es: string; english: string}> {
export async function ObtenerTitulos(type: ContentType, meta_id: string) : Promise<{english: string}> {
    /**Obtiene el titulo de una pelicula/serie en spanish_es spanish_mx y english */
    
    const promises = [
        ObtenerTituloIngles(type, meta_id),
        //ObtenerTitulosSpanish(type, meta_id),
    ];

    const resultados = await Promise.all(promises);

    //generar objeto con los titulos
    const titulos = {
        ...resultados[0],
        ...resultados[1],
    };
    return titulos;
}

/*
async function ObtenerTitulosSpanish(type: ContentType, meta_id: string) : Promise< any > {
    
    try {

        type === "movie" ? meta_id = meta_id : meta_id = meta_id.split(':')[0];

        //obtenemos el ID que utiliza themoviedb
        const urlID = `https://api.themoviedb.org/3/find/${meta_id}?api_key=${apikey}&language=en-US&external_source=imdb_id`;

        const responseID = await axios.get(urlID);

        const themoviedb_id = type === "movie" ? responseID.data.movie_results[0].id : responseID.data.tv_results[0].id;

        const urlTranslations = (type === "movie") ? `https://api.themoviedb.org/3/movie/${themoviedb_id}/translations?api_key=${apikey}` : `https://api.themoviedb.org/3/tv/${themoviedb_id}/translations?api_key=${apikey}`;

        const responseTranslations = await axios.get(urlTranslations);

        const response_mx = responseTranslations.data.translations.find((translation: any) => translation.iso_3166_1 === "MX");
    
        const response_es = responseTranslations.data.translations.find((translation: any) => translation.iso_3166_1 === "ES");

        const spanish_mx = (response_mx && response_mx.data && response_mx.data.name) ? response_mx.data.name : "";

        const spanish_es = (response_es && response_es.data && response_es.data.name) ? response_es.data.name : "";
    
        return {
            spanish_mx: spanish_mx,
            spanish_es: spanish_es,
        };
    } catch (error: any) {
        //404
        if (error.response && error.response.status === 404) {
            console.log(`No se encontraron nombres en español para ${meta_id}.`);
            
        } else {
            console.log(error);
        }
        return {
            spanish_mx: "",
            spanish_es: "",
        };
    };
}
*/

async function ObtenerTituloIngles(type: ContentType, meta_id: string) : Promise<{ english: string; }> {
    try {

        type === "movie" ? meta_id = meta_id : meta_id = meta_id.split(':')[0];

        const response = await axios.get(`https://v3-cinemeta.strem.io/meta/${type}/${meta_id}.json`);

	    return {
            english: response.data.meta.name,
        };
    } catch (error: any) {
        //404
        if (error.response && error.response.status === 404) {
            console.log(`No se encontraron nombres en ingles para ${meta_id}.`);
        } else {
            console.log(error);
        }
        return {
            english: "",
        };
    }
}