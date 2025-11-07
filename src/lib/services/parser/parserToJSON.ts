import { browser } from '$app/environment';
import { fileHandler } from './fileHandler';
import { sendMessageToWorker } from './workerHandler';

let worker: Worker | null = null;

// Verificar que la aplicacion esta corriendo en el navegador, donde, si es el caso generamos un nuevo trabajador (nuevo hilo de ejecucion) para ejecutar varias tareas en simultáneo
if (browser) {
    worker = new Worker(
        new URL('../../workers/worker.ts', import.meta.url),
        { type: 'module' }
    )
}

// Funcion que convierte el archivo YML recibido como respuesta y lo convierte en un string
const convertYMLToString = async (res: Response): Promise<string> => {
    const fileData = (await res).text()
    return fileData
}

// Funcion principal encargada de parsear el archivo YAML a JSON
export const parseToJSON = async (path: string): Promise<any> => {
    if (!browser || !worker) {
        throw new Error('Worker is not available')
    }
    try {
        const response = await fileHandler(path);
        const fileData = await convertYMLToString(response)
        return sendMessageToWorker(worker, fileData)
    } catch (error: any) {
        throw new Error(`Failed to parse YAML: ${error.message}`);
    }
}


