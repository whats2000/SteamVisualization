import * as d3 from 'd3';
import { ScatterPlotData } from '../../types';

export const createYearHistogram = (data: ScatterPlotData[], minYear: number, maxYear: number, updateYearFilter: (years: [number, number]) => void) => {
  const margin = { top: 10, right: 30, bottom: 50, left: 50 };
  const width = 1200 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  // Remove any existing SVG elements
  d3.select('#visualization-year-filter').select('svg').remove();

  const svg = d3.select('#visualization-year-filter').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const years = data.map(d => new Date(d.release_date).getFullYear());

  const x = d3.scaleLinear()
    .domain([minYear, maxYear])
    .range([0, width]);

  const histogram = d3.histogram()
    .value((d: number) => d)
    .domain(x.domain() as [number, number])
    .thresholds(x.ticks(maxYear - minYear));

  const bins = histogram(years);

  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length) as number])
    .range([height, 0]);

  svg.append('g')
    .selectAll('rect')
    .data(bins)
    .enter()
    .append('rect')
    .attr('x', 1)
    .attr('transform', d => `translate(${x(d.x0 as number)},${y(d.length)})`)
    .attr('width', d => x(d.x1 as number) - x(d.x0 as number) - 1)
    .attr('height', d => height - y(d.length))
    .style('fill', '#69b3a2');

  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(maxYear - minYear))
    .selectAll('text')
    .style('fill', 'white');

  // Add Y axis
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5))
    .selectAll('text')
    .style('fill', 'white');

  // X label
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 10)
    .style('text-anchor', 'middle')
    .style('fill', 'white')
    .text('Year');

  // Y label
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 55)
    .attr('x', -height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .style('fill', 'white')
    .text('Number of games');

  const brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on('end', brushed);

  svg.append('g')
    .attr('class', 'brush')
    .call(brush);

  function brushed(event: d3.D3BrushEvent<SVGSVGElement>) {
    const selection = event.selection as [number, number];
    if (!selection) return;
    const [x0, x1] = selection.map(x.invert);
    updateYearFilter([Math.round(x0), Math.round(x1)]);
  }
};
