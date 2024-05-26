import * as d3 from 'd3';
import { GameData } from '../../../types';

// Function to create the reviews plot
export const createReviewsPlot = (gameDetails: GameData) => {
  // Set dimensions and margins for the plot
  const margin = { top: 20, right: 30, bottom: 120, left: 80 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Append SVG and group elements
  const svg = d3.select('#reviews-plot-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Prepare the data
  const data = [
    { type: 'Positive', count: gameDetails.positive },
    { type: 'Negative', count: gameDetails.negative }
  ];

  // Set the scales
  const x = d3.scaleBand()
    .domain(data.map(d => d.type))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count) as number])
    .range([height, 0]);

  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
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
    .attr('y', height + margin.bottom - 10)
    .attr('text-anchor', 'middle')
    .style('fill', 'white')
    .style('font-size', '16px')
    .text('Reviews');

  // Add bars
  svg.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.type) as number)
    .attr('width', x.bandwidth())
    .attr('y', d => y(d.count))
    .attr('height', d => height - y(d.count))
    .style('fill', d => d.type === 'Positive' ? '#69b3a2' : '#d95f02')
    .on('mouseover', function (event, d) {
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`${d.type} Reviews: ${d.count}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
        d3.select(this).style('fill', 'lightgray');
      })
      .on('mouseout', function (_event, d) {
        tooltip.transition().duration(500).style('opacity', 0);
        d3.select(this).style('fill', d.type === 'Positive' ? '#69b3a2' : '#d95f02');
      });
};
