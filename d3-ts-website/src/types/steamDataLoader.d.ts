import { GameData } from "./gameData";

type SteamDataLoader = {
  loadScatterPlotData(): Promise<GameData[]>;
}
