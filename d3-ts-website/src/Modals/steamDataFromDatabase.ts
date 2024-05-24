import { GameData } from "../types";

export class SteamDataFromDatabase {
  async loadAllData(): Promise<GameData[]> {
    const response = await fetch('http://localhost:5000/api/games_price_peak_ccu');
    if (!response.ok) {
      throw new Error('Failed to fetch data from database');
    }
    return response.json();
  }
}
