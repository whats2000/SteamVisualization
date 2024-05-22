import { GameData, GameDataDictionary } from './types';
import { createScatterPlot } from "./scatterPlot";

let loadedChunks = 0;
const totalChunks = 9;

const updateProgressBar = (percentage: number) => {
  const progressBar = document.getElementById('progress-bar') as HTMLElement;
  progressBar.style.width = `${percentage}%`;
  progressBar.setAttribute('aria-valuenow', percentage.toString());
};

const showSpinner = () => {
  const spinner = document.getElementById('spinner') as HTMLElement;
  spinner.style.display = 'block';
};

const hideSpinner = () => {
  const spinner = document.getElementById('spinner') as HTMLElement;
  spinner.style.display = 'none';
};

const hideProgressBar = () => {
  const progressBar = document.getElementById('loading-container') as HTMLElement;
  progressBar.style.display = 'none';
};

const showVisualization = () => {
  const visualizationContainer = document.getElementById('visualization-container') as HTMLElement;
  visualizationContainer.classList.add('visible');
};

const loadChunk = async (chunkNumber: number): Promise<GameDataDictionary> => {
  const response = await fetch(`./data/chunk_${chunkNumber}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load chunk ${chunkNumber}`);
  }
  return response.json();
};

const loadAllData = async (): Promise<GameData[]> => {
  const dataPromises: Promise<GameDataDictionary>[] = [];
  for (let i = 0; i < totalChunks; i++) {
    dataPromises.push(loadChunk(i).then((data) => {
      loadedChunks++;
      updateProgressBar((loadedChunks / totalChunks) * 100);
      return data;
    }));
  }
  const dataArrays = await Promise.all(dataPromises);
  const combinedData = Object.assign({}, ...dataArrays);
  return Object.values(combinedData);
};

const init = async () => {
  showSpinner();

  try {
    const data = await loadAllData();

    // Scatter plot
    createScatterPlot(data);
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    hideSpinner();
    hideProgressBar();
    showVisualization();
  }
};

// Ensure the DOM is fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
  init().catch(console.error);
});
