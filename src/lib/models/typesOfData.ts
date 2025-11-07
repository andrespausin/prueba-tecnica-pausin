// Sacar de aqui
export interface ObjectData {
    time: string;
    value: number;
}

export interface GraphicData {
    time: Date,
    value: number
}


// Sacar de aqui
export interface InitialData {
    temperature: {
        unit: string;
        values: ObjectData[];
    },
    power: {
        unit: string;
        values: ObjectData[];
    }
}