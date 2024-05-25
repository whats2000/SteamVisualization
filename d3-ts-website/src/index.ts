import 'bootstrap/dist/css/bootstrap.min.css';

import { SteamDataFromJson } from './modals/steamDataFromJson';
import { SteamDataFromDatabase } from './modals/steamDataFromDatabase';
import { SpinnerProgress } from './modals/spinnerProgress';
import { createScatterPlot } from './plot/scatterPlot';
import { timelinePlot } from './plot/timelinePlot';

const checkDatabaseConnection = async (): Promise<boolean> => {
  return fetch('http://localhost:5000/api/check_database')
    .then(response => {
      if (!response.ok) {
        console.log('No available database connection');
        return false;
      }

      // The response is a JSON object {'status': 'online'}
      return response.json();
    }).then(data => {
      if (data && data.status === 'online') {
        console.log('Database connection is online');
        return true;
      }

      console.log('No available database connection');
      return false;
    })
    .catch(() => {
      console.log('Failed to check database connection:');
      return false;
    });
};

const init = async () => {
  SpinnerProgress.showSpinner();

  try {
    const isDatabaseOnline = await checkDatabaseConnection();
    const dataLoader = isDatabaseOnline ? new SteamDataFromDatabase() : new SteamDataFromJson();
    const scatterPlotData = await dataLoader.loadScatterPlotData();

    // Scatter plot
    createScatterPlot(scatterPlotData);

    // Below data will not be loaded if the database is offline
    if (!isDatabaseOnline) return;

    const timelineData = await (dataLoader as SteamDataFromDatabase).loadTimelineData();

    // Timeline plot
    timelinePlot(timelineData);
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    SpinnerProgress.hideSpinner();
    SpinnerProgress.hideProgressBar();
    SpinnerProgress.showVisualization();
  }
};


// Ensure the DOM is fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
  init().catch(console.error);
});
