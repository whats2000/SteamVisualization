import * as d3 from 'd3';
import {GameData} from "./types";

export const createScatterPlot = (data: GameData[]) => {
    // Filter data to remove invalid entries
    const filteredData = data.filter(d => d.price > 0 && d.peak_ccu > 0);

    // Set dimensions and margins for the plot
    const margin = {top: 20, right: 30, bottom: 40, left: 50};
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Remove any existing SVG elements
    d3.select('#visualization-container').select('svg').remove();

    // Append SVG and group elements
    const svg = d3.select('#visualization-container').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set scales
    const x = d3.scaleLog()
        .domain([d3.min(filteredData, d => d.price) as number, d3.max(filteredData, d => d.price) as number])
        .range([0, width]);

    const y = d3.scaleLog()
        .domain([d3.min(filteredData, d => d.peak_ccu) as number, d3.max(filteredData, d => d.peak_ccu) as number])
        .range([height, 0]);

    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10, d3.format('~g')))
        .selectAll('text')
        .style('fill', 'white');

    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(y).ticks(10, d3.format('~g')))
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

    // Add dots with interactivity
    svg.append('g')
        .selectAll('circle')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.price))
        .attr('cy', d => y(d.peak_ccu))
        .attr('r', 2.5)
        .style('fill', '#69b3a2')
        .style('opacity', 0.5)
        .on('mouseover', function (event, d) {
            d3.select(this).attr('r', 5).style('fill', '#ffcc00');
            tooltip.transition().duration(200).style('opacity', .9);
            tooltip.html(`Name: ${d.name}<br/>Price: ${d.price}<br/>Peak CCU: ${d.peak_ccu}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function (_d) {
            d3.select(this).attr('r', 2.5).style('fill', '#69b3a2');
            tooltip.transition().duration(500).style('opacity', 0);
        })
        .on('click', function (_event, _d) {
            d3.selectAll('circle').style('stroke', 'none');
            d3.select(this).style('stroke', 'red').style('stroke-width', 2);
        });

    // Add labels
    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', width)
        .attr('y', height + margin.top - 30)
        .text('Price (Log Scale)')
        .style('fill', 'white');

    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 70)
        .attr('x', -margin.top)
        .text('Peak CCU (Log Scale)')
        .style('fill', 'white');
};
