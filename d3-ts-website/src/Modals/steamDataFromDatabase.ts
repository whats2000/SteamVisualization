import { GameData, SteamDataLoader } from "../types";

export class SteamDataFromDatabase implements SteamDataLoader{
  async loadScatterPlotData(): Promise<GameData[]> {
    const response = await fetch('http://localhost:5000/api/games_price_peak_ccu');
    if (!response.ok) {
      throw new Error('Failed to fetch data from database');
    }
    return response.json();
  }

  async loadTimelineData(): Promise<GameData[]> {
    const response = await fetch('http://localhost:5000/api/game_timeline');
    if (!response.ok) {
      throw new Error('Failed to fetch data from database');
    }
    return response.json();
  }
}
