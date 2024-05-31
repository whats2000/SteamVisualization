import { ScatterPlotData } from '../../types';
import * as d3 from 'd3';

interface BarPlotData {
  name: string;
  avgPeakCCU: number;
  count: number;
}

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
    d => d.cat,
  );

  // Calculate average peak ccu for each genre
  const genresAvgPeakCCU = d3.rollup(
    data.flatMap(d => d.genres.map(genre => ({ genre, peak_ccu: d.peak_ccu }))),
    v => d3.mean(v, d => d.peak_ccu) as number,
    d => d.genre,
  );

  const categoriesCount = d3.rollup(
    data.flatMap(d => d.categories.map(cat => ({ cat, count: 1 }))),
    v => v.length,
    d => d.cat,
  );

  const genresCount = d3.rollup(
    data.flatMap(d => d.genres.map(genre => ({ genre, count: 1 }))),
    v => v.length,
    d => d.genre,
  );

  const categoriesData = Array.from(categoriesAvgPeakCCU, ([name, avgPeakCCU]) => ({
    name,
    avgPeakCCU,
    count: categoriesCount.get(name) as number,
  } as BarPlotData)).sort((a, b) =>
    b.count - a.count || b.avgPeakCCU - a.avgPeakCCU || a.name.localeCompare(b.name)
  );

  const genresData = Array.from(genresAvgPeakCCU, ([name, avgPeakCCU]) => ({
    name,
    avgPeakCCU,
    count: genresCount.get(name) as number,
  } as BarPlotData)).sort((a, b) =>
    b.count - a.count || b.avgPeakCCU - a.avgPeakCCU || a.name.localeCompare(b.name)
  );

  console.log(categoriesData)
  console.log(genresData)

  // Function to create horizontal bar charts
  const createBarChart = (data: BarPlotData[], containerId: string, selectedItems: string[], updateFilter: (items: string[]) => void) => {
    const margin = { top: 10, right: 30, bottom: 135, left: 140 };
    const width = 500 - margin.left - margin.right;
    let height = 650 - margin.top - margin.bottom;

    // Set up color scales
    const colorScale = d3.scaleSequential(containerId === '#categories-filter' ? d3.interpolateOranges : d3.interpolateGnBu)
      .domain([0, d3.max(data, d => d.avgPeakCCU) as number]);

    const maxAvgPeakCCU = d3.max(data, d => d.avgPeakCCU) as number;

    if (containerId === '#genres-filter') {
      height = 500 - margin.top - margin.bottom;
    }

    const container = d3.select(containerId);
    container.selectAll('svg').remove();

    const svg = container.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    let x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) as number])
      .nice()
      .range([0, width]);

    const y = d3.scaleBand()
      .range([0, height])
      .domain(data.map(d => d.name))
      .padding(0.1);

    svg.append('g')
      .call(d3.axisLeft(y));

    const xAxis = svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .attr('class', 'x-axis')
      .call(d3.axisBottom(x).ticks(5));

    // Add x-axis title
    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('x', width / 2 + 50)
      .attr('y', height + margin.bottom - 90)
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

    const showTooltip = (event: MouseEvent, d: BarPlotData) => {
      tooltip.transition().duration(200).style('opacity', .9);
      tooltip.html(`Category: ${d.name}<br>Count: ${d.count}<br>Avg Peak CCU: ${d.avgPeakCCU.toFixed(2)}`)
        .style('left', (event.pageX + 5) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    };

    const hideTooltip = () => {
      tooltip.transition().duration(500).style('opacity', 0);
    };

    const bars = svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', d => y(d.name) as number)
      .attr('width', d => x(d.count))
      .attr('height', y.bandwidth())
      .attr('fill', d => selectedItems.includes(d.name) ? '#5c7e10' : colorScale(d.avgPeakCCU))
      .attr('class', d => selectedItems.includes(d.name) ? 'selected' : '')
      .on('click', function(_event, d) {
        const selected = selectedItems.includes(d.name)
          ? selectedItems.filter(item => item !== d.name)
          : [...selectedItems, d.name];
        updateFilter(selected);

        // Remove the tooltip on click
        tooltip.transition().duration(500).style('opacity', 0);
      })
      .on('mouseover', showTooltip)
      .on('mouseout', hideTooltip);

    // Add selection triangles
    const polygons = svg.selectAll('polygon')
      .data(data.filter(d => selectedItems.includes(d.name)))
      .enter()
      .append('polygon')
      .attr('points', d => {
        const xValue = x(d.count);
        const yValue = y(d.name) as number;
        const bandwidth = y.bandwidth();
        return `${xValue},${yValue} ${xValue + 10},${yValue + bandwidth / 2} ${xValue},${yValue + bandwidth}`;
      })
      .attr('fill', '#5c7e10')
      .on('click', function(_event, d) {
        const selected = selectedItems.includes(d.name)
          ? selectedItems.filter(item => item !== d.name)
          : [...selectedItems, d.name];
        updateFilter(selected);

        // Remove the tooltip on click
        tooltip.transition().duration(500).style('opacity', 0);
      })
      .on('mouseover', showTooltip)
      .on('mouseout', hideTooltip);

    // Add legend
    const legendHeight = 20;
    const legendWidth = 250;
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(60,${height + margin.bottom - 55})`);

    const legendScale = d3.scaleSequential(containerId === '#categories-filter' ? d3.interpolateOranges : d3.interpolateGnBu)
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
      .attr('x', legendWidth / 2)
      .attr('y', legendHeight + 20)
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .text('Avg Peak CCU');

    // Remove slider if it already exists
    container.selectAll('.slider-container').remove();

    // Add slider for x-axis range adjustment
    const sliderContainer = container.append('div')
      .attr('class', 'slider-container position-absolute')
      .style('left', '10px')
      .style('bottom', '45px')
      .style('width', `${width}px`);

    sliderContainer.append('input')
      .attr('type', 'range')
      .attr('min', '1')
      .attr('max', '100')
      .attr('value', '100')
      .attr('class', 'form-range')
      .style('width', '180px')
      .on('input', function() {
        const scale = +this.value / 100;
        const maxCount = d3.max(data, d => d.count) as number;
        const minCount = d3.min(data, d => d.count) as number;
        const range = maxCount - minCount;
        const newMax = minCount + range * scale;
        x.domain([minCount, newMax]).nice();
        bars.attr('width', d => x(d.count) - x(minCount));
        polygons.attr('points', d => {
          const xValue = x(d.count) - x(minCount);
          const yValue = y(d.name) as number;
          const bandwidth = y.bandwidth();
          return `${xValue},${yValue} ${xValue + 10},${yValue + bandwidth / 2} ${xValue},${yValue + bandwidth}`;
        });
        xAxis.call(d3.axisBottom(x).ticks(5));
      });

    // Slider label
    container.append('label')
      .attr('for', 'slider')
      .text('Adjust x-axis range')
      .style('color', 'white')
      .attr('class', 'position-absolute')
      .attr('text-anchor', 'middle')
      .style('left', '20px')
      .style('bottom', '10px')
      .style('font-size', '1rem')
  };

  // Create horizontal bar charts for categories and genres
  createBarChart(categoriesData, '#categories-filter', filterCategories, updateCategoriesFilter);
  createBarChart(genresData, '#genres-filter', filterGenres, updateGenresFilter);
};
