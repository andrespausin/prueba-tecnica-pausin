import { type ObjectData } from "$lib/models/typesOfData";
import { timeFormatter } from "./timeFormatter";

export const calculateInitialIndex = (time: Date, array: ObjectData[]): number => {
    const formattedTime = timeFormatter(time);
    const index = array.findIndex((item: ObjectData) => item.time == formattedTime);
    return index
};
