// Funcion encargada de comunicarse directamente con el worker
export const sendMessageToWorker = (
    worker: Worker,
    fileData: string
): Promise<{}> => {
    return new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {

            const { success, temperatureData, powerData } = event.data;

            if (success === false) {
                reject(new Error('Worker error'))
            } else {
                resolve({ temperatureData, powerData })
            }

            worker.removeEventListener('message', handleMessage)
        }

        worker.addEventListener('message', handleMessage)
        worker.postMessage(fileData)
    })
}