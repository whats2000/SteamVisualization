import { Offcanvas } from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { SteamDataFromJson } from './modals/steamDataFromJson';
import { SteamDataFromDatabase } from './modals/steamDataFromDatabase';
import { SpinnerProgress } from './modals/spinnerProgress';
import { createScatterPlot } from './plot/scatterPlot';

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

const addFilterButtonEventListener = (filterOffcanvas: Offcanvas) => {
  const filterButton = document.getElementById('filter-button');

  if (filterButton) {
    filterButton.addEventListener('click', () => {
      filterOffcanvas.show();
    });
  }

  const closeButton = document.getElementById('offcanvasFilterClose');

  if (closeButton) {
    closeButton.addEventListener('click', () => {
      filterOffcanvas.hide();
    });
  }
}

const init = async () => {
  SpinnerProgress.showSpinner();

  const filterOffcanvasElement = document.getElementById('offcanvasFilter') as HTMLElement;
  const filterOffcanvas = new Offcanvas(filterOffcanvasElement);

  addFilterButtonEventListener(filterOffcanvas);

  try {
    const isDatabaseOnline = await checkDatabaseConnection();
    const dataLoader = isDatabaseOnline ? new SteamDataFromDatabase() : new SteamDataFromJson(1);
    await dataLoader.loadScatterPlotData();

    // Scatter plot
    createScatterPlot(dataLoader);
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    SpinnerProgress.hideSpinner();
    SpinnerProgress.hideLoadingContainer();
    SpinnerProgress.showVisualization();
  }
};


// Ensure the DOM is fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
  init().catch(console.error);
});
