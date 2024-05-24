import {GameData, GameDataDictionary} from "../types";
import {SpinnerProgress} from "./spinnerProgress";

export class SteamDataFromJson {
    private loadedChunks = 0;
    private totalChunks = 9;

    constructor(private maxChunks = 9) {
    }

    private loadChunk = async (chunkNumber: number): Promise<GameDataDictionary> => {
        const response = await fetch(`../../data/chunk_${chunkNumber}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load chunk ${chunkNumber}`);
        }
        return response.json();
    };

    public loadAllData = async (): Promise<GameData[]> => {
        const dataPromises: Promise<GameDataDictionary>[] = [];
        for (let i = 0; i < this.totalChunks; i++) {
            if (i > this.maxChunks) break;

            dataPromises.push(this.loadChunk(i).then((data) => {
                this.loadedChunks++;
                SpinnerProgress.updateProgressBar((this.loadedChunks / this.totalChunks) * 100);
                return data;
            }));
        }
        const dataArrays = await Promise.all(dataPromises);
        const combinedData = Object.assign({}, ...dataArrays);
        return Object.values(combinedData);
    };
}