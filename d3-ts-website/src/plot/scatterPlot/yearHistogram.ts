import { ScatterPlotData } from '../../types';
import * as d3 from 'd3';

export const createYearHistogram = (data: ScatterPlotData[], minYear: number, maxYear: number, callback: (years: [number, number]) => void) => {
  const years = data.map(d => new Date(d.release_date).getFullYear());
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const width = 960 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  // Remove any existing SVG elements
  d3.select('#visualization-year-filter').select('svg').remove();

  // Append SVG and group elements
  const svg = d3.select('#visualization-year-filter').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([minYear, maxYear])
    .range([0, width]);

  const histogram = d3.histogram()
    .value(d => d)
    .domain(x.domain() as [number, number])
    .thresholds(x.ticks(maxYear - minYear));

  const bins = histogram(years);

  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length) as number])
    .range([height, 0]);

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10, 'd'))
    .selectAll('text')
    .style('fill', 'white');

  svg.append('g')
    .call(d3.axisLeft(y).ticks(5))
    .selectAll('text')
    .style('fill', 'white');

  svg.selectAll('rect')
    .data(bins)
    .enter()
    .append('rect')
    .attr('x', 1)
    .attr('transform', d => `translate(${x(d.x0 as number)},${y(d.length)})`)
    .attr('width', d => x(d.x1 as number) - x(d.x0 as number) - 1)
    .attr('height', d => height - y(d.length))
    .style('fill', '#69b3a2')
    .style('opacity', 0.7);

  // X label
  svg.append('text')
    .attr('text-anchor', 'end')
    .attr('x', width)
    .attr('y', height + margin.top - 30)
    .text('Year')
    .style('fill', 'white');

  // Y label
  svg.append('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 70)
    .attr('x', -margin.top)
    .text('Counts')
    .style('fill', 'white');

  // Add brush
  const brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on('brush end', (event: d3.D3BrushEvent<unknown>) => {
      const selection = event.selection as [number, number];
      if (!selection) return;

      const [x0, x1] = selection.map(x.invert);
      callback([Math.round(x0), Math.round(x1)]);
    });

  svg.append('g')
    .attr('class', 'brush')
    .call(brush);
};