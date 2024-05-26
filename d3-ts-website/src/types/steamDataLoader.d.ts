import { ScatterPlotData } from './scatterPlotData';
import { GameData } from './gameData';
import { GameRecommendation } from './gameRecommendation';

type SteamDataLoader = {
  /**
   * Load scatter plot data from the database
   */
  loadScatterPlotData(): void;

  /**
   * Get scatter plot data
   */
  getScatterPlotData(): ScatterPlotData[];

  /**
   * Load game details from the database
   * @param gameId - the game ID
   */
  loadGameDetails(gameId: string): Promise<GameData>;

  /**
   * Load recommended games from the database
   */
  getRecentlyRecommendation(gameId: string): Promise<GameRecommendation | false>;
}
