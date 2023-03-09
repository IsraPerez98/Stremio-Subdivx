import { obtenerIDTuSubtitulo } from "../../../scrapping/id";

test("Obtener ID TuSubtitulo", async () => {
    const id = await obtenerIDTuSubtitulo({ english: "Game of Thrones" });
    expect(id).toBe(770);

    const id2 = await obtenerIDTuSubtitulo({ english: "The Last of Us" });
    expect(id2).toBe(5320);
});

// cache hit

test("Obtener ID TuSubtitulo (Cache)", async () => {
    const id = await obtenerIDTuSubtitulo({ english: "Game of Thrones" });
    expect(id).toBe(770);
});