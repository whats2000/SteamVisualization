export class SpinnerProgress {
  static updateProgressBar = (percentage: number) => {
    const progressBar = document.getElementById('progress-bar') as HTMLElement;
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute('aria-valuenow', percentage.toString());
  };

  static showSpinner = () => {
    const spinner = document.getElementById('spinner') as HTMLElement;
    spinner.style.display = 'block';
  };

  static hideSpinner = () => {
    const spinner = document.getElementById('spinner') as HTMLElement;
    spinner.style.display = 'none';
  };

  static hideLoadingContainer = () => {
    const loadingContainer = document.getElementById('loading-container') as HTMLElement;
    loadingContainer.style.display = 'none';
  };

  static showVisualization = () => {
    const visualizationYearFilter = document.getElementById('visualization-year-filter') as HTMLElement;
    visualizationYearFilter.classList.add('visible');

    const visualizationContainer = document.getElementById('visualization-container') as HTMLElement;
    visualizationContainer.classList.add('visible');

    const visualizationContainer2 = document.getElementById('visualization-container-2') as HTMLElement;
    visualizationContainer2.classList.add('visible');
  };
}