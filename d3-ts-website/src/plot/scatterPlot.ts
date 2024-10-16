import * as d3 from 'd3';
import { ScatterPlotData, SteamDataLoader } from '../types';
import { createYearHistogram } from './scatterPlot/yearHistogram';
import { createZoomPlot } from './scatterPlot/zoomPlot';
import { createCategoriesGenresBarPlot } from './scatterPlot/categoriesGenresBarPlot';

export const createScatterPlot = (dataLoader: SteamDataLoader) => {
  const data = dataLoader.getScatterPlotData();

  // Set up the year filter
  const years = data.map(d => new Date(d.release_date).getFullYear());
  const minYear = d3.min(years) as number;
  const maxYear = d3.max(years) as number;

  const ownerRanges = [
    '0 - 0', '0 - 20000', '20000 - 50000', '50000 - 100000',
    '100000 - 200000', '200000 - 500000', '500000 - 1000000', '1000000 - 2000000',
    '2000000 - 5000000', '5000000 - 10000000', '10000000 - 20000000',
    '20000000 - 50000000', '50000000 - 100000000', '100000000 - 200000000',
  ];

  let filteredData = [...data];

  let activeLegend: string | null = null;
  let selectedPoint: ScatterPlotData | null = null;
  let currentMinYear = minYear;
  let currentMaxYear = maxYear;
  let currentScaleType = 'symlog';
  let filterCategories: string[] = [];
  let filterGenres: string[] = [];
  let hasShownAlert = false;

  const updateChart = (event: d3.D3BrushEvent<SVGSVGElement>) => {
    const extent = event.selection;
    if (!extent) return;

    currentBrushExtent = extent as [[number, number], [number, number]];
    updateZoomPlot();
  }

  const updateHasShownAlert = (hasAlert: boolean) => {
    hasShownAlert = hasAlert;
  }

  const updateZoomPlot = () => {
    createZoomPlot(
      filteredData, activeLegend, currentBrushExtent, currentScaleType as 'linear' | 'symlog', x, y, colorScale,
      ownerRanges, dataLoader, width, height, selectedPoint, margin, updateZoomCircles, hasShownAlert, updateSelectedPoint,
      updateHasShownAlert,
    );
  }

  const updateCategoriesGenresBarPlot = () => {
    createCategoriesGenresBarPlot(data, filterCategories, filterGenres, updateCategoriesFilter, updateGenresFilter);
  }

  const updateYearFilter = ([newMinYear, newMaxYear]: [number, number]) => {
    currentMinYear = newMinYear;
    currentMaxYear = newMaxYear;
    applyFilters();
  }

  const resetCircleGroup = (circlesGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>) => {
    circlesGroup.selectAll('circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.price as number))
      .attr('cy', d => y(d.peak_ccu as number))
      .attr('r', 2.5)
      .style('fill', d => colorScale(ownerRanges.indexOf(d.estimated_owners)))
      .style('opacity', 0.5);
  }

  const updateCircles = (circlesGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>) => {
    (circlesGroup.selectAll('circle') as d3.Selection<SVGCircleElement, ScatterPlotData, SVGGElement, unknown>)
      .transition()
      .duration(500)
      .style('opacity', (d: ScatterPlotData) => {
        if (!activeLegend) {
          return 0.5;
        }
        return d.estimated_owners === activeLegend ? 1 : 0.01;
      });

    // Update the legend opacity
    (legend.selectAll('rect') as d3.Selection<SVGRectElement, string, SVGGElement, unknown>)
      .transition()
      .duration(500)
      .style('opacity', (d: string) => {
        if (!activeLegend) {
          return 1;
        }
        return d === activeLegend ? 1 : 0.01;
      });

    updateZoomCircles(d3.selectAll('#zoom-container circle') as any);
    updateZoomPlot();
  }

  const updateZoomCircles = (zoomedCircles: d3.Selection<SVGCircleElement, ScatterPlotData, SVGGElement, unknown>) => {
    zoomedCircles.transition().duration(500)
      .style('opacity', (d: ScatterPlotData) => {
        if (d === selectedPoint) {
          return 1;
        }

        if (!activeLegend) {
          return d === selectedPoint ? 1 : 0.5;
        }
        return d.estimated_owners === activeLegend ? (d === selectedPoint ? 1 : 1) : 0.01;
      })
      .attr('r', (d: ScatterPlotData) => d === selectedPoint ? 7 : 5);
  }

  const applyFilters = () => {
    const searchText = (document.getElementById('search-game') as HTMLInputElement).value.toLowerCase();

    filteredData = data.filter(d => {
      const year = new Date(d.release_date).getFullYear();
      const matchesCategories = filterCategories.length === 0 || filterCategories.some(cat => d.categories.includes(cat));
      const matchesGenres = filterGenres.length === 0 || filterGenres.some(genre => d.genres.includes(genre));

      return d.peak_ccu > 0 &&
        d.name.toLowerCase().includes(searchText) &&
        year >= currentMinYear &&
        year <= currentMaxYear &&
        matchesCategories &&
        matchesGenres;
    });

    updateScatterPlotZoomPlot();
  };

  const setUpDefaultScale = () => {
    // Add X axis
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickValues([0, 1, 2, 3, 5, 7, 10, 15, 20, 30, 40, 60, 100, 150, 250]).ticks(20))
      .selectAll('text')
      .style('fill', 'white')
      .attr('font-size', '12px');

    // Add Y axis
    svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y)
        .tickValues([0, 2, 10, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000])
        .ticks(15, d3.format('~g')))
      .selectAll('text')
      .style('fill', 'white')
      .attr('font-size', '12px');
  };

  const updateScale = () => {
    setScales(currentScaleType);

    svg.selectAll('.x-axis').remove();
    svg.selectAll('.y-axis').remove();

    if (currentScaleType === 'linear') {
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .attr('class', 'x-axis')
        .call(d3.axisBottom(x).ticks(10))
        .selectAll('text')
        .style('fill', 'white')
        .attr('font-size', '12px');

      svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).ticks(10, d3.format('~g')))
        .selectAll('text')
        .style('fill', 'white')
        .attr('font-size', '12px');
    } else {
      setUpDefaultScale();
    }

    svg.select('#x-axis-label')
      .text(`Price (${currentScaleType.charAt(0).toUpperCase() + currentScaleType.slice(1)} Scale)`);

    svg.select('#y-axis-label')
      .text(`Peak CCU (${currentScaleType.charAt(0).toUpperCase() + currentScaleType.slice(1)} Scale)`);

    updateScatterPlotZoomPlot();
  };

  // Set the scales based on the selected scale type
  const setScales = (scaleType: string) => {
    x = (scaleType === 'linear' ? d3.scaleLinear() : d3.scaleSymlog())
      .domain([
        d3.min(filteredData, d => d.price) as number,
        d3.max(filteredData, d => d.price) as number,
      ])
      .range([0, width]);

    y = (scaleType === 'linear' ? d3.scaleLinear() : d3.scaleSymlog())
      .domain([
        d3.min(filteredData, d => d.peak_ccu) as number,
        d3.max(filteredData, d => d.peak_ccu) as number,
      ])
      .range([height, 0]);
  };

  // Update categories filter
  const updateCategoriesFilter = (categories: string[]) => {
    filterCategories = categories;
    applyFilters();
    updateCategoriesGenresBarPlot();
  };

  // Update genres filter
  const updateGenresFilter = (genres: string[]) => {
    filterGenres = genres;
    applyFilters();
    updateCategoriesGenresBarPlot();
  };

  const updateSelectedPoint = (point: ScatterPlotData | null) => {
    selectedPoint = point;
  }

  const updateScatterPlotZoomPlot = () => {
    circlesGroup.selectAll('circle').remove();
    resetCircleGroup(circlesGroup);
    updateCircles(circlesGroup);
    updateZoomPlot();
  };

  // Set dimensions and margins for the plot
  const margin = { top: 50, right: 150, bottom: 50, left: 60 };
  const width = 650 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  let currentBrushExtent: [[number, number], [number, number]] = [[-10, -10], [-10, -10]];

  // Append SVG and group elements
  const svg = d3.select('#visualization-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  d3.select('#visualization-container-2').append('svg')
    .attr('id', 'zoom-container')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Define color scale with a sequential color scheme
  const colorScale = d3.scaleSequential(d3.interpolatePlasma)
    .domain([0, ownerRanges.length - 1]);

  let x: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number> = d3.scaleSymlog()
    .domain([
      d3.min(filteredData, d => d.price) as number,
      d3.max(filteredData, d => d.price) as number,
    ])
    .range([0, width]);
  let y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number> = d3.scaleSymlog()
    .domain([
      d3.min(filteredData, d => d.peak_ccu) as number,
      d3.max(filteredData, d => d.peak_ccu) as number,
    ])
    .range([height, 0]);

  setScales(currentScaleType);

  // Add dots without interactivity on the original plot
  const circlesGroup = svg.append('g');
  resetCircleGroup(circlesGroup);

  // Add brush
  const brush = d3.brush()
    .extent([[-30, -30], [width + 30, height + 30]])
    .on('brush', updateChart)
    .on('end', updateChart);

  svg.append('g')
    .attr('class', 'brush')
    .call(brush);

  // Add labels
  svg.append('text')
    .attr('text-anchor', 'end')
    .attr('x', width)
    .attr('y', height + margin.top - 10)
    .attr('id', 'x-axis-label')
    .text(`Price (${currentScaleType.charAt(0).toUpperCase() + currentScaleType.slice(1)} Scale)`)
    .style('fill', 'white');

  svg.append('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 80)
    .attr('x', -margin.top)
    .attr('id', 'y-axis-label')
    .text(`Peak CCU (${currentScaleType.charAt(0).toUpperCase() + currentScaleType.slice(1)} Scale)`)
    .style('fill', 'white');

  // Add title
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', margin.top - 65)
    .attr('text-anchor', 'middle')
    .style('fill', 'white')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text('Peak CCU vs Price (Brush to Zoom)');

  // Add color legend with title
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width + 5}, 20)`);

  legend.append('text')
    .attr('x', 0)
    .attr('y', -10)
    .style('fill', 'white')
    .style('font-weight', 'bold')
    .text('Estimated Owners');

  legend.selectAll('rect')
    .data(ownerRanges)
    .enter()
    .append('rect')
    .attr('x', 0)
    .attr('y', (_d, i) => i * 20)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', (_d, i) => colorScale(i))
    .style('cursor', 'pointer')
    .on('click', function(_event, d) {
      const isActive = activeLegend === d;
      activeLegend = isActive ? null : d;

      d3.selectAll('.legend rect').classed('active', false);
      if (!isActive) {
        d3.select(this).classed('active', true);
      }

      updateCircles(circlesGroup);
    });

  legend.selectAll('text.legend-label')
    .data(ownerRanges)
    .enter()
    .append('text')
    .attr('x', 24)
    .attr('y', (_d, i) => i * 20 + 9)
    .attr('dy', '.35em')
    .attr('class', 'legend-label')
    .style('fill', 'white')
    .text(d => {
      const range = d.split(' - ').map(value => {
        const num = parseInt(value);
        if (num >= 1000000) {
          return `${num / 1000000}M`;
        } else if (num >= 1000) {
          return `${num / 1000}K`;
        } else {
          return num.toString();
        }
      });
      return range.join(' - ');
    });

  // Add search functionality
  const searchInput = document.getElementById('search-game') as HTMLInputElement;
  searchInput.addEventListener('input', applyFilters);

  // Add scale toggle functionality
  const linearScaleButton = document.getElementById('linear') as HTMLInputElement;
  const symlogScaleButton = document.getElementById('symlog') as HTMLInputElement;

  linearScaleButton?.addEventListener('change', () => {
    if (linearScaleButton.checked) {
      currentScaleType = 'linear';
      updateScale();
    }
  });

  symlogScaleButton?.addEventListener('change', () => {
    if (symlogScaleButton.checked) {
      currentScaleType = 'symlog';
      updateScale();
    }
  });

  // Set up the default scale
  setUpDefaultScale();

  // Update the scatter plot and zoom plot
  updateScatterPlotZoomPlot();

  // Add histogram for game release years
  createYearHistogram(data, minYear, maxYear, updateYearFilter);

  // Create categories and genres bar plot
  createCategoriesGenresBarPlot(data, filterCategories, filterGenres, updateCategoriesFilter, updateGenresFilter);
};
