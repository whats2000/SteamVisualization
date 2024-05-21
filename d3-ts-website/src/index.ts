import * as d3 from 'd3';

const data = [10, 20, 30, 40, 50];

const width = 500;
const height = 500;
const margin = { top: 20, right: 30, bottom: 40, left: 40 };

const svg = d3.select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

const x = d3.scaleBand()
  .domain(data.map((_, i) => i.toString()))
  .range([0, width - margin.left - margin.right])
  .padding(0.1);

const y = d3.scaleLinear()
  .domain([0, d3.max(data) as number])
  .nice()
  .range([height - margin.top - margin.bottom, 0]);

svg.append('g')
  .attr('class', 'x-axis')
  .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
  .call(d3.axisBottom(x));

svg.append('g')
  .attr('class', 'y-axis')
  .call(d3.axisLeft(y));

svg.selectAll('.bar')
  .data(data)
  .enter()
  .append('rect')
  .attr('class', 'bar')
  .attr('x', (_, i) => x(i.toString()) as number)
  .attr('y', d => y(d))
  .attr('width', x.bandwidth())
  .attr('height', d => height - margin.top - margin.bottom - y(d));
