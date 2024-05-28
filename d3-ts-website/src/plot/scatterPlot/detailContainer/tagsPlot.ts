import * as d3 from 'd3';
import { GameData } from '../../../types';

// Function to create the tags plot
export const createTagsPlot = (gameDetails: GameData) => {
  // Set dimensions and margins for the plot
  const margin = { top: 40, right: 90, bottom: 100, left: 50 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Append SVG and group elements
  const svg = d3.select('#tags-plot-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Prepare the data
  const tagsData = Object.entries(gameDetails.tags).map(([key, value]) => ({
    tag: key,
    count: value
  }));

  // Set the scales
  const x = d3.scaleBand()
    .domain(tagsData.map(d => d.tag))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(tagsData, d => d.count) as number])
    .range([height, 0]);

  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .style('fill', 'white');

  // Add Y axis
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5))
    .selectAll('text')
    .style('fill', 'white');

  // Tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('padding', '5px')
    .style('border-radius', '5px')
    .style('box-shadow', '0 0 10px rgba(0,0,0,0.5)');

  // Plot title
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .style('fill', 'white')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text('Tags Distribution');

  // Color scale
  const colorScale = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, d3.max(tagsData, d => d.count) as number]);

  // Add bars
  svg.selectAll('.bar')
    .data(tagsData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.tag) as number)
    .attr('width', x.bandwidth())
    .attr('y', d => y(d.count))
    .attr('height', d => height - y(d.count))
    .style('fill', d => colorScale(d.count))
    .on('mouseover', function (event, d) {
      tooltip.transition().duration(200).style('opacity', .9);
      tooltip.html(`${d.tag}: ${d.count}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
      d3.select(this).style('fill', 'lightgray');
    })
    .on('mouseout', function () {
      tooltip.transition().duration(500).style('opacity', 0);
      (d3.select(this) as d3.Selection<any, { tag: string; count: number; }, null, undefined>)
        .style('fill', d => colorScale(d.count));
    });

  // Legend
  const legendHeight = 260;
  const legendWidth = 20;

  const legend = svg.append('g')
    .attr('transform', `translate(${width + 10}, ${height - legendHeight})`);

  const legendScale = d3.scaleLinear()
    .domain(colorScale.domain())
    .range([legendHeight, 0]);

  const legendAxis = d3.axisRight(legendScale)
    .ticks(5)
    .tickSize(6)
    .tickFormat(d3.format('.0f'));

  legend.append('g')
    .attr('transform', `translate(${legendWidth}, 0)`)
    .call(legendAxis)
    .selectAll('text')
    .style('fill', 'white');

  const legendGradient = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'legend-gradient')
    .attr('x1', '0%')
    .attr('y1', '100%')
    .attr('x2', '0%')
    .attr('y2', '0%');

  legendGradient.selectAll('stop')
    .data(d3.range(0, 1.1, 0.1))
    .enter()
    .append('stop')
    .attr('offset', d => d)
    .attr('stop-color', d => colorScale(d * (colorScale.domain()[1] as number)));

  legend.append('rect')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .style('fill', 'url(#legend-gradient)');
};
