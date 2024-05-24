import { GameData, GameDataDictionary, SteamDataLoader } from "../types";
import {SpinnerProgress} from "./spinnerProgress";

export class SteamDataFromJson implements SteamDataLoader {
    private loadedChunks = 0;
    private totalChunks = 9;

    constructor(private maxChunks = 9) {
    }

    private loadScatterPlotDataChunk = async (chunkNumber: number): Promise<GameDataDictionary> => {
        const response = await fetch(`../../data/chunk_${chunkNumber}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load chunk ${chunkNumber}`);
        }
        const chunkData: any[] = await response.json();

        return chunkData.reduce((acc: GameDataDictionary, data) => {
            acc[data.game_id] = {
                name: data.name,
                price: data.price,
                peak_ccu: data.peak_ccu
            };
            return acc;
        });
    };

    public loadScatterPlotData = async (): Promise<GameData[]> => {
        const dataPromises: Promise<GameDataDictionary>[] = [];
        for (let i = 0; i < this.totalChunks; i++) {
            if (i > this.maxChunks) break;

            dataPromises.push(this.loadScatterPlotDataChunk(i).then((data) => {
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
