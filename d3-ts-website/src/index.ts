import * as d3 from 'd3';

import { GameData, GameDataDictionary } from './types';

const loadChunk = async (chunkNumber: number): Promise<GameDataDictionary> => {
  const response = await fetch(`./data/chunk_${chunkNumber}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load chunk ${chunkNumber}`);
  }
  return response.json();
};

const loadAllData = async (): Promise<GameData[]> => {
  const chunkCount = 9; // Adjust this based on the number of chunks generated
  const dataPromises: Promise<GameDataDictionary>[] = [];
  for (let i = 0; i < chunkCount; i++) {
    dataPromises.push(loadChunk(i));
  }
  const dataArrays = await Promise.all(dataPromises);
  const combinedData = Object.assign({}, ...dataArrays);
  return Object.values(combinedData);
};

loadAllData().then((data: GameData[]) => {
  console.log(data);

  // Filter data to remove invalid entries
  const filteredData = data.filter(d => d.price > 0 && d.peak_ccu > 0);

  // Set dimensions and margins for the plot
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Remove any existing SVG elements
  d3.select('svg').remove();

  // Append SVG and group elements
  const svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Set scales
  const x = d3.scaleLog()
    .domain([1, d3.max(filteredData, d => d.price) as number])
    .range([0, width]);

  const y = d3.scaleLog()
    .domain([1, d3.max(filteredData, d => d.peak_ccu) as number])
    .range([height, 0]);

  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10, d3.format('~g')));

  // Add Y axis
  svg.append('g')
    .call(d3.axisLeft(y).ticks(10, d3.format('~g')));

  // Add dots
  svg.append('g')
    .selectAll('dot')
    .data(filteredData)
    .enter()
    .append('circle')
    .attr('cx', d => x(d.price))
    .attr('cy', d => y(d.peak_ccu))
    .attr('r', 2.5)
    .style('fill', '#69b3a2');

  // Add labels
  svg.append('text')
    .attr('text-anchor', 'end')
    .attr('x', width)
    .attr('y', height + margin.top + 20)
    .text('Price (Log Scale)');

  svg.append('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 20)
    .attr('x', -margin.top)
    .text('Peak CCU (Log Scale)');
}).catch(error => {
  console.error('Error loading data:', error);
});
