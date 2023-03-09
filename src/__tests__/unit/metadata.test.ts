import { ObtenerTitulos } from "../../metadata";

test("Obtener Titulo Peliculas", async () => {
    const titulos = await ObtenerTitulos("movie", "tt0111161");
    expect(titulos.english).toBe("The Shawshank Redemption");

    const titulos2 = await ObtenerTitulos("movie", "tt1375666");
    expect(titulos2.english).toBe("Inception");
});

test("Obtener Titulo Series", async () => {
    const titulos = await ObtenerTitulos("series", "tt0944947:1");
    expect(titulos.english).toBe("Game of Thrones");

    const titulos2 = await ObtenerTitulos("series", "tt3581920:1");
    expect(titulos2.english).toBe("The Last of Us");
});

// test the cache hit

test("Obtener Titulo Pelicula (Cache)", async () => {
    const titulos = await ObtenerTitulos("movie", "tt0111161");
    expect(titulos.english).toBe("The Shawshank Redemption");
});

test("Obtener Titulo Serie (Cache)", async () => {
    const titulos = await ObtenerTitulos("series", "tt0944947:1");
    expect(titulos.english).toBe("Game of Thrones");
});