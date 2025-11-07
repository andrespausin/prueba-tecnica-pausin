export const timeFormatter = (date: Date): string => {
    let formattedDate

    // En caso de ser un valor no multiplo de 5, toma el valor anterior, y cuando el segundo sea 5, lo actualiza
    if (date.getSeconds() % 5 !== 0) {
        formattedDate = `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}:${date.getSeconds() < 10 ? `0${date.getSeconds() - (date.getSeconds() % 5)}` : date.getSeconds() - (date.getSeconds() % 5)}`;
    } else {
        // Caso contrario (que los segundos sean múltiplos de 5, entonces el toma el valor virgen)
        formattedDate = `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}:${date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()}`;
    }

    return formattedDate;
};