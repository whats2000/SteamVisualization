import { GameDataDictionary, SteamDataLoader, ScatterPlotData } from '../types';
import { SpinnerProgress } from './spinnerProgress';

export class SteamDataFromJson implements SteamDataLoader {
  private loadedChunks = 0;
  private totalChunks = 9;

  constructor(private maxChunks = 9) {
  }

  private loadScatterPlotDataChunk = async (chunkNumber: number): Promise<ScatterPlotData[]> => {
    const response = await fetch(`../../data/chunk_${chunkNumber}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load chunk ${chunkNumber}`);
    }
    const data: GameDataDictionary = await response.json();
    return Object.values(data).map((
      {
        name,
        price,
        peak_ccu,
        header_image,
      }) => ({
      name,
      price,
      peak_ccu,
      header_image,
    }));
  };

  public loadScatterPlotData = async (): Promise<ScatterPlotData[]> => {
    const dataPromises: Promise<ScatterPlotData[]>[] = [];
    for (let i = 0; i < this.totalChunks; i++) {
      if (i > this.maxChunks) break;

      dataPromises.push(this.loadScatterPlotDataChunk(i).then((data) => {
        this.loadedChunks++;
        SpinnerProgress.updateProgressBar((this.loadedChunks / this.totalChunks) * 100);
        return data;
      }));
    }
    const dataArrays = await Promise.all(dataPromises);
    return dataArrays.flat();
  };
}
