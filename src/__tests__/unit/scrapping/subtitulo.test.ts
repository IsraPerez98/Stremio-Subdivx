import { obtenerSubtitulos } from "../../../scrapping/subtitulo";


test("Obtener Subtitulos TuSubtitulo.com", async () => {
    const subtitulos = await obtenerSubtitulos(770, 6, 4); // Game of Thrones S06E01
    expect(subtitulos).toHaveLength(9);

    // los subtitulos deberian tener el id, url y lang

    expect(subtitulos[0]).toHaveProperty("id");
    expect(subtitulos[0]).toHaveProperty("url");
    expect(subtitulos[0]).toHaveProperty("lang");

    // debe incluir el siguiente subtitulo correspondiente a la temporada 6, episodio 1

    expect(subtitulos).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                id: "1,50079,0-eng", 
                lang: "eng", 
                url: "/updated/1/50079/0"
            }),
        ])
    );

});
