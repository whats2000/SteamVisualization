import { SteamDataFromJson } from "./Modals/steamDataFromJson";
import { SteamDataFromDatabase } from "./Modals/steamDataFromDatabase";
import { SpinnerProgress } from "./Modals/spinnerProgress";
import { createScatterPlot } from "./plot/scatterPlot";
import { timelinePlot } from "./plot/timelinePlot";

const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:5000/api/check_database');
    if (!response.ok) {
      console.log('No available database connection');
      return false;
    }
    const result = await response.json();

    if (result.status === 'online') {
      console.log('Database connection is online');
      return true;
    } else {
      console.log('Database connection is offline');
      return false;
    }
  } catch (error) {
    console.error('Failed to check database connection:', error);
    return false;
  }
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
