// Funcion que verifica que el path que se está importando es el correcto
export const fileHandler = async (path: string): Promise<Response> => {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to fetch file at ${path}: ${response.statusText}`);
    }
    console.log(`File fetched successfully from ${path}`);
    return response;
}