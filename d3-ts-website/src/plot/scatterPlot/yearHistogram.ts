import * as d3 from 'd3';
import { ScatterPlotData } from '../../types';

export const createYearHistogram = (data: ScatterPlotData[], minYear: number, maxYear: number, updateYearFilter: (years: [number, number]) => void) => {
  const margin = { top: 40, right: 30, bottom: 50, left: 50 };
  const width = 1200 - margin.left - margin.right;
  const height = 250 - margin.top - margin.bottom;

  let binType: 'yearly' | 'monthly' = 'yearly';

  // Clear the container
  d3.select('#visualization-year-filter').selectAll('*').remove();

  const svg = d3.select('#visualization-year-filter')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  function updateHistogram() {
    const parseTime = binType === 'yearly' ? d3.timeYear : d3.timeMonth;
    const formatTime = binType === 'yearly' ? d3.timeFormat('%Y') : d3.timeFormat('%Y-%m');
    const xDomain: [Date, Date] = binType === 'yearly' ? [new Date(minYear, 0, 1), new Date(maxYear, 0, 1)] : [new Date(minYear, 0, 1), new Date(maxYear + 1, 0, 1)];

    const histogram = d3.histogram<Date, Date>()
      .value((d: Date) => d)
      .domain(xDomain)
      .thresholds(parseTime.range(...xDomain));

    const bins = histogram(data.map(d => new Date(d.release_date)));

    x.domain(xDomain);
    y.domain([0, d3.max(bins, d => d.length) as number]);

    // Define color scale
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(bins, d => d.length) as number]);

    svg.selectAll('rect').remove();
    svg.selectAll('.trendline').remove();

    svg.append('g')
      .selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', d => x(d.x0 as Date))
      .attr('y', d => y(d.length))
      .attr('width', d => x(d.x1 as Date) - x(d.x0 as Date) - 1)
      .attr('height', d => height - y(d.length))
      .style('fill', d => colorScale(d.length));

    // Add the trend line
    const trendlineData = bins.map(d => ({ date: (d.x0 as Date), value: d.length }));
    const line = d3.line<{ date: Date, value: number }>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveBasis);

    svg.append('path')
      .datum(trendlineData)
      .attr('class', 'trendline')
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add X axis
    svg.select('.x-axis').remove();
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(formatTime as any))
      .selectAll('text')
      .style('fill', 'white');

    // Add Y axis
    svg.select('.y-axis').remove();
    svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('fill', 'white');

    // X label
    svg.select('.x-label').remove();
    svg.append('text')
      .attr('class', 'x-label')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .style('text-anchor', 'middle')
      .style('fill', 'white')
      .text(binType === 'yearly' ? 'Year' : 'Month');

    // Y label
    svg.select('.y-label').remove();
    svg.append('text')
      .attr('class', 'y-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 55)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', 'white')
      .text('Number of games');

    const brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on('brush end', brushed);

    svg.select('.brush').remove();
    svg.append('g')
      .attr('class', 'brush')
      .call(brush);

    function brushed(event: d3.D3BrushEvent<SVGSVGElement>) {
      const selection = event.selection as [number, number];
      if (!selection) {
        updateYearFilter([minYear, maxYear]);
        return;
      }
      const [x0, x1] = selection.map(x.invert);
      const minDate = new Date(x0);
      const maxDate = new Date(x1);
      const minYearSelected = minDate.getFullYear();
      const maxYearSelected = maxDate.getFullYear();
      updateYearFilter([minYearSelected, maxYearSelected]);
    }
  }

  // Add bin type toggle button
  d3.select('#bin-toggle').remove();
  const toggle = d3.select('#visualization-year-filter')
    .append('button')
    .classed('btn btn-outline-light position-absolute top-0 start-0 mt-4', true)
    .style('margin-left', '100px')
    .attr('id', 'bin-toggle')
    .text('Switch to Monthly')
    .on('click', () => {
      binType = binType === 'yearly' ? 'monthly' : 'yearly';
      toggle.text(binType === 'yearly' ? 'Switch to Monthly' : 'Switch to Yearly');
      updateHistogram();
      updateYearFilter([minYear, maxYear]);
    });

  updateHistogram();
};
