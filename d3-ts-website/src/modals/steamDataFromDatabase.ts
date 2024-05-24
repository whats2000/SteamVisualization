import { ScatterPlotData, TimelinePlotData, SteamDataLoader } from '../types';
import { SpinnerProgress } from './spinnerProgress';

export class SteamDataFromDatabase implements SteamDataLoader {
  async loadScatterPlotData(): Promise<ScatterPlotData[]> {
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
    return response.json();
  }

  async loadTimelineData(): Promise<TimelinePlotData[]> {
    const response = await fetch('http://localhost:5000/api/game_timeline');
    if (!response.ok) {
      throw new Error('Failed to fetch data from database');
    }
    return response.json();
  }
}
