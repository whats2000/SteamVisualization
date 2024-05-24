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

  static hideProgressBar = () => {
    const progressBar = document.getElementById('loading-container') as HTMLElement;
    progressBar.style.display = 'none';
  };

  static showVisualization = () => {
    const visualizationContainer = document.getElementById('visualization-container') as HTMLElement;
    visualizationContainer.classList.add('visible');

    const visualizationContainer2 = document.getElementById('visualization-container-2') as HTMLElement;
    visualizationContainer2.classList.add('visible');

    const detailsContainer = document.getElementById('details-container') as HTMLElement;
    detailsContainer.classList.add('visible');
  };
}