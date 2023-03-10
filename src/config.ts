import stremioSDK from "stremio-addon-sdk";
const { publishToCentral } = stremioSDK;

import dotenv from 'dotenv';
dotenv.config();

const nodeEnv = process.env.NODE_ENV ? 'beamup':'development';

const config = {
    port: Number(process.env.PORT) || 7000,
    host: 'http://localhost:7000',
};

function configDev(): void {
    console.log('Configurando para entorno de desarrollo');
    config.host = 'http://localhost' + config.port;
}

function configBeamup() : void {
    console.log('Configurando para beamup');
    console.log('process.env', process.env);
    config.host = 'https://58196d6c26cf-stremio-tusubtitulo.baby-beamup.club';
    config.port = Number(process.env.PORT);
    
    // Publicar en lista de addons
    publishToCentral(`${config.host}/manifest.json`);
}

switch(nodeEnv) {
    case 'development':
        configDev();
        break;
    case 'beamup':
        configBeamup();
        break;
    default:
        configDev();
        break;
}

export default config;