import {
  ScatterPlotData,
  TimelinePlotData,
  SteamDataLoader,
  GameData,
  GameRecommendation,
} from '../types';
import { SpinnerProgress } from './spinnerProgress';

export class SteamDataFromDatabase implements SteamDataLoader {
  private loadedScatterPlotData: ScatterPlotData[] = [];

  async loadScatterPlotData() {
    // Update percentage of progress bar every 0.2 seconds until 99%
    let percentage = 0;

    // Update the progress bar every 0.2 seconds
    const interval = setInterval(() => {
      percentage += 1;
      SpinnerProgress.updateProgressBar(percentage);
      if (percentage >= 99) {
        clearInterval(interval);
      }
    }, 200);

    const response = await fetch('http://localhost:5000/api/games_price_peak_ccu');
    if (!response.ok) {
      throw new Error('Failed to fetch data from database');
    }

    this.loadedScatterPlotData = await response.json();
  }

  public getScatterPlotData(): ScatterPlotData[] {
    return this.loadedScatterPlotData;
  }

  public loadGameDetails = async (gameId: string): Promise<GameData> => {
    const response = await fetch(`http://localhost:5000/api/game_details/${gameId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch game details from database');
    }
    return response.json();
  };

  async loadTimelineData(): Promise<TimelinePlotData[]> {
    const response = await fetch('http://localhost:5000/api/game_timeline');
    if (!response.ok) {
      throw new Error('Failed to fetch data from database');
    }
    return response.json();
  }

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
