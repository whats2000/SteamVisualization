import { GameData, GameDataDictionary, GameRecommendation, ScatterPlotData, SteamDataLoader } from '../types';
import { SpinnerProgress } from './spinnerProgress';

export class SteamDataFromJson implements SteamDataLoader {
  private loadedChunks = 0;
  private totalChunks = 9;
  private maxChunks: number;
  private loadedScatterPlotData: ScatterPlotData[] = [];
  private loadedGameData: GameDataDictionary = {};

  constructor(maxChunks: number = 9) {
    this.maxChunks = maxChunks;
  }

  private loadScatterPlotDataChunk = async (chunkNumber: number): Promise<ScatterPlotData[]> => {
    let data: GameDataDictionary;
    try {
      let response = await fetch(`../data/chunk_${chunkNumber}.json`);
      if (!response.ok) {
        response = await fetch(`https://whats2000.github.io/SteamVisualization/data/chunk_${chunkNumber}.json`);
      }

      if (!response.ok) {
        return [];
      }

      console.log('Using local data');
      data = await response.json();
    } catch (error) {
      const response = await fetch(`https://whats2000.github.io/SteamVisualization/data/chunk_${chunkNumber}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load chunk ${chunkNumber}`);
      }

      console.log('Using remote data');
      data = await response.json();
    }

    this.loadedGameData = { ...this.loadedGameData, ...data };

    return Object.entries(data).map(([game_id, gameData]) => ({
      game_id,
      name: gameData.name,
      release_date: gameData.release_date,
      price: gameData.price,
      peak_ccu: gameData.peak_ccu,
      header_image: gameData.header_image,
      estimated_owners: gameData.estimated_owners,
    }));
  };

  public loadScatterPlotData = async () => {
    this.loadedScatterPlotData = [];
    this.loadedGameData = {};

    const dataPromises: Promise<ScatterPlotData[]>[] = [];
    for (let i = 0; i < this.totalChunks; i++) {
      if (i > this.maxChunks) break;

      dataPromises.push(
        this.loadScatterPlotDataChunk(i).then((data) => {
          this.loadedChunks++;
          SpinnerProgress.updateProgressBar((this.loadedChunks / this.totalChunks) * 100);
          return data;
        }),
      );
    }
    const dataArrays = await Promise.all(dataPromises);
    this.loadedScatterPlotData = dataArrays.flat();
  };

  public getScatterPlotData = (): ScatterPlotData[] => {
    return this.loadedScatterPlotData;
  };

  public loadTimelineData = async (): Promise<GameData[]> => {
    return Object.values(this.loadedGameData);
  };

  public loadGameDetails = async (gameId: string): Promise<GameData> => {
    const gameData = this.loadedGameData[gameId];
    if (!gameData) {
      throw new Error(`Game data for ID ${gameId} not found`);
    }
    return gameData;
  };

  public getRecentlyRecommendation = async (gameId: string): Promise<GameRecommendation | false> => {
    try {
      const response = await fetch(`http://localhost:5000/api/game_recommendations/${gameId}`);
      if (!response.ok) {
        return false;
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return false;
    }
  };
}
