import { ScatterPlotData } from '../../types';
import * as d3 from 'd3';

export const createCategoriesGenresBarPlot = (
  data: ScatterPlotData[],
  filterCategories: string[],
  filterGenres: string[],
  updateCategoriesFilter: (categories: string[]) => void,
  updateGenresFilter: (genres: string[]) => void,
) => {
  // Calculate average peak ccu for each category
  const categoriesAvgPeakCCU = d3.rollup(
    data.flatMap(d => d.categories.map(cat => ({ cat, peak_ccu: d.peak_ccu }))),
    v => d3.mean(v, d => d.peak_ccu) as number,
    d => d.cat
  );

  // Calculate average peak ccu for each genre
  const genresAvgPeakCCU = d3.rollup(
    data.flatMap(d => d.genres.map(genre => ({ genre, peak_ccu: d.peak_ccu }))),
    v => d3.mean(v, d => d.peak_ccu) as number,
    d => d.genre
  );

  const categoriesCount = d3.rollup(
    data.flatMap(d => d.categories.map(cat => ({ cat, count: 1 }))),
    v => v.length,
    d => d.cat
  );

  const genresCount = d3.rollup(
    data.flatMap(d => d.genres.map(genre => ({ genre, count: 1 }))),
    v => v.length,
    d => d.genre
  );

  const categoriesData = Array.from(categoriesAvgPeakCCU, ([name, avgPeakCCU]) => ({
    name,
    avgPeakCCU,
    count: categoriesCount.get(name) as number
  }));

  const genresData = Array.from(genresAvgPeakCCU, ([name, avgPeakCCU]) => ({
    name,
    avgPeakCCU,
    count: genresCount.get(name) as number
  }));

  // Set up color scales
  const maxAvgPeakCCU = d3.max([...categoriesData, ...genresData], d => d.avgPeakCCU) as number;
  const colorScale = d3.scaleSequential(d3.interpolateGnBu).domain([0, maxAvgPeakCCU]);

  // Function to create horizontal bar charts
  const createBarChart = (data: { name: string, avgPeakCCU: number, count: number }[], containerId: string, selectedItems: string[], updateFilter: (items: string[]) => void) => {
    const margin = { top: 10, right: 30, bottom: 100, left: 140 };
    const width = 500 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const container = d3.select(containerId);
    container.selectAll('svg').remove();

    const svg = container.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) as number])
      .nice()
      .range([0, width]);

    const y = d3.scaleBand()
      .range([0, height])
      .domain(data.map(d => d.name))
      .padding(0.1);

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5));

    // Add x-axis title
    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('x', width / 2 + 50)
      .attr('y', height + margin.bottom - 60)
      .text('Number of Games')
      .style('fill', 'white');

    // Tooltip
    const tooltip = d3.select('.tooltip');
    if (tooltip.empty()) {
      d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('padding', '5px')
        .style('border-radius', '5px')
        .style('box-shadow', '0 0 10px rgba(0,0,0,0.5)');
    }

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', d => y(d.name) as number)
      .attr('width', d => x(d.count))
      .attr('height', y.bandwidth())
      .attr('fill', d => selectedItems.includes(d.name) ? '#5c7e10' : colorScale(d.avgPeakCCU))
      .attr('class', d => selectedItems.includes(d.name) ? 'selected' : '')
      .on('click', function (_event, d) {
        const selected = selectedItems.includes(d.name)
          ? selectedItems.filter(item => item !== d.name)
          : [...selectedItems, d.name];
        updateFilter(selected);

        // Remove the tooltip on click
        tooltip.transition().duration(500).style('opacity', 0);
      })
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 0.7);
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`Category: ${d.name}<br>Count: ${d.count}<br>Avg Peak CCU: ${d.avgPeakCCU.toFixed(2)}`)
          .style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 1);
        tooltip.transition().duration(500).style('opacity', 0);
      });

    // Add selection triangles
    svg.selectAll('polygon')
      .data(data.filter(d => selectedItems.includes(d.name)))
      .enter()
      .append('polygon')
      .attr('points', d => {
        const xValue = x(d.count);
        const yValue = y(d.name) as number;
        const bandwidth = y.bandwidth();
        return `${xValue},${yValue} ${xValue + 10},${yValue + bandwidth / 2} ${xValue},${yValue + bandwidth}`;
      })
      .attr('fill', '#5c7e10');

    // Add legend
    const legendHeight = 20;
    const legendWidth = width / 2;
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(0,${height + margin.bottom - 25})`);

    const legendScale = d3.scaleSequential(d3.interpolateGnBu)
      .domain([0, maxAvgPeakCCU]);

    const legendAxis = d3.axisBottom(d3.scaleLinear()
      .domain([0, maxAvgPeakCCU])
      .range([0, legendWidth]))
      .ticks(5);

    legend.append('g')
      .selectAll('rect')
      .data(d3.range(0, legendWidth, legendWidth / 10))
      .enter()
      .append('rect')
      .attr('x', d => d)
      .attr('y', -legendHeight)
      .attr('width', legendWidth / 10)
      .attr('height', legendHeight)
      .style('fill', d => legendScale(d * maxAvgPeakCCU / legendWidth));

    legend.append('g')
      .attr('transform', `translate(0,0)`)
      .call(legendAxis);

     legend.append('text')
      .attr('x', width - 90)
      .attr('y', legendHeight - 25)
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .text('Avg Peak CCU');
  };

  // Create horizontal bar charts for categories and genres
  createBarChart(categoriesData, '#categories-filter', filterCategories, updateCategoriesFilter);
  createBarChart(genresData, '#genres-filter', filterGenres, updateGenresFilter);
};
