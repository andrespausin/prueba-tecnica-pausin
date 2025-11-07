import { load } from 'js-yaml'
import { type ObjectData, type InitialData } from '$lib/models/typesOfData';

// Funcion que permite escuchar el evento desde el hilo principal
self.onmessage = (event) => {

    const formattedData = fromYAMLToJSON(event.data)

    // En caso de que no se haya podido formatear la data, se retorna un valor erroneo basado en la variable success
    if (!formattedData) {

        return ({ success: false, temperatureData: null, powerData: null })
    }

    // postMessage nos permite enviar como respuesta el evento de vuelta al hilo principal
    self.postMessage({ success: true, temperatureData: formattedData.temperatureData, powerData: formattedData.powerData })

}

// Funcion que permite leer desde un archivo de text en formato yaml o yml, convertirlo a un objeto JSON para poder ser manejado en la interfaz web
const fromYAMLToJSON = (yamlString: string) => {

    const yamlText = load(yamlString) as InitialData;
    if (!yamlText) {
        throw new Error("Invalid YAML");
    }

    const temperatureData: ObjectData[] = yamlText.temperature.values.map((item: ObjectData) => ({
        time: item.time,
        // Conversion de grados Kelvin a Celsius 
        // C = (dK / 10) - 273.15
        value: parseFloat((parseFloat((item.value / 10).toFixed(2)) - 273.15).toFixed(2))
    }))

    const powerData: ObjectData[] = yamlText.power.values.map((item: ObjectData) => ({
        time: item.time,
        // Conversion de MW a kW
        // kW = MW * 1000
        value: parseFloat((item.value * 1000).toFixed(2))
    }))

    // Retorna ambos arreglos
    return { temperatureData, powerData };
}