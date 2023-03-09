import express from "express";
import request from "supertest";
import router from "../../../server/subtitulos";

describe("Servidor Subtitulos", () => {
    const app = express();
    app.use(router);

    test("Obtener Subtitulos TuSubtitulo.com", async () => {
        const response = await request(app).get("/updated/1/50079/0");
        expect(response.status).toBe(200);
        expect(response.type).toBe("text/srt");
        expect(response.header["content-disposition"]).toBe(`attachment; filename="subtitulos.srt"`);
    });

    test("Obtener Subtitulos TuSubtitulo.com (Cache)", async () => {
        const response = await request(app).get("/updated/1/50079/0");
        expect(response.status).toBe(200);
        expect(response.type).toBe("text/srt");
        expect(response.header["content-disposition"]).toBe(`attachment; filename="subtitulos.srt"`);
    });
});