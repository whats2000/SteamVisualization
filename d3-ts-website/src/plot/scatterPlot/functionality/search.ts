import { ScatterPlotData } from '../../../types';

export const addSearchFunctionality = (
  data: ScatterPlotData[],
  filteredData: ScatterPlotData[],
  updatePlot: () => void,
  minYear: number,
  maxYear: number
) => {
  const searchInput = document.getElementById('search-game') as HTMLInputElement;
  searchInput.addEventListener('input', function () {
    const searchText = searchInput.value.toLowerCase();

    filteredData.length = 0;
    data.forEach(d => {
      const year = new Date(d.release_date).getFullYear();
      if (d.peak_ccu > 0 && year >= minYear && year <= maxYear && d.name.toLowerCase().includes(searchText)) {
        filteredData.push(d);
      }
    });

    updatePlot();
  });
};
