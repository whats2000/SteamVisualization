import * as d3 from 'd3';
import { ScatterPlotData } from '../types';
import { createYearHistogram } from './scatterPlot/yearHistogram';

export const createScatterPlot = (data: ScatterPlotData[]) => {
  // Set up the year filter
  const years = data.map(d => new Date(d.release_date).getFullYear());
  const minYear = d3.min(years) as number;
  const maxYear = d3.max(years) as number;

  let filteredData = data.filter(d => d.peak_ccu > 0);

  // Set dimensions and margins for the plot
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const width = 600 - margin.left - margin.right;
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
  const x = d3.scaleSymlog()
    .domain([d3.min(filteredData, d => d.price) as number, d3.max(filteredData, d => d.price) as number])
    .range([0, width]);

  const y = d3.scaleSymlog()
    .domain([d3.min(filteredData, d => d.peak_ccu) as number, d3.max(filteredData, d => d.peak_ccu) as number])
    .range([height, 0]);

  // Define color scale
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(filteredData.map(d => d.estimated_owners));

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
    .attr('cx', d => x(d.price as number))
    .attr('cy', d => y(d.peak_ccu as number))
    .attr('r', 2.5)
    .style('fill', d => colorScale(d.estimated_owners))
    .style('opacity', 0.5);

  // Add brush
  const brush = d3.brush()
    .extent([[-30, -30], [width + 30, height + 30]])
    .on('brush', updateChart)
    .on('end', updateChart);

  svg.append('g')
    .attr('class', 'brush')
    .call(brush);

  // Add labels
  svg.append('text')
    .attr('text-anchor', 'end')
    .attr('x', width)
    .attr('y', height + margin.top - 30)
    .text('Price (Symlog Scale)')
    .style('fill', 'white');

  svg.append('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 70)
    .attr('x', -margin.top)
    .text('Peak CCU (Symlog Scale)')
    .style('fill', 'white');

  function updateChart(event: d3.D3BrushEvent<SVGSVGElement>) {
    const extent = event.selection;
    if (!extent) return;

    const [[x0, y0], [x1, y1]] = extent as [[number, number], [number, number]];

    // Create new scales for a zoomed region
    const xZoom = d3.scaleSymlog()
      .domain([x.invert(x0), x.invert(x1)])
      .range([0, width]);

    const yZoom = d3.scaleSymlog()
      .domain([y.invert(y1), y.invert(y0)])
      .range([height, 0]);

    // Remove existing zoomed svg
    d3.select('#zoom-container').remove();

    // Append new zoomed svg
    const zoomSvg = d3.select('#visualization-container-2').append('svg')
      .attr('id', 'zoom-container')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add zoomed dots
    zoomSvg.append('g')
      .selectAll('circle')
      .data(filteredData.filter(d => x(d.price) >= x0 && x(d.price) <= x1 && y(d.peak_ccu) >= y0 && y(d.peak_ccu) <= y1))
      .enter()
      .append('circle')
      .attr('cx', d => xZoom(d.price as number))
      .attr('cy', d => yZoom(d.peak_ccu as number))
      .attr('r', 5)
      .style('fill', d => colorScale(d.estimated_owners))
      .style('opacity', 0.5)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 5).style('fill', '#ffcc00');
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`Name: ${d.name}<br/>Price: ${d.price}<br/>Peak CCU: ${d.peak_ccu}<br/>Estimated Owners: ${d.estimated_owners}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function(_d) {
        d3.select(this).attr('r', 5).style('fill', ((d: ScatterPlotData) => colorScale(d.estimated_owners as string)) as any);
        tooltip.transition().duration(500).style('opacity', 0);
      })
      .on('click', function(_event, d) {
        d3.selectAll('circle').style('stroke', 'none');
        d3.select(this).style('stroke', 'red').style('stroke-width', 2);

        // Update details container with selected game details
        const detailsContainer = document.getElementById('details-container') as HTMLElement;
        detailsContainer.classList.add('visible');

        if (detailsContainer) {
          detailsContainer.innerHTML = `
            <h3>${d.name}</h3>
            <img src="${d.header_image}" alt="${d.name}" style="max-width: 100%; height: auto;">
            <p>Price: ${d.price}</p>
            <p>Peak CCU: ${d.peak_ccu}</p>
            <p>Estimated Owners: ${d.estimated_owners}</p>
            <p>Release Date: ${d.release_date}</p>
          `;
        }
      });

    // Add zoomed X axis
    zoomSvg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xZoom).ticks(10, d3.format('~g')))
      .selectAll('text')
      .style('fill', 'white');

    // Add zoomed Y axis
    zoomSvg.append('g')
      .call(d3.axisLeft(yZoom).ticks(10, d3.format('~g')))
      .selectAll('text')
      .style('fill', 'white');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .translateExtent([[-width, -height], [2 * width, 2 * height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', zoomed);

    zoomSvg.call(zoom as any);

    function zoomed(event: { transform: d3.ZoomTransform }) {
      const newX = event.transform.rescaleX(xZoom);
      const newY = event.transform.rescaleY(yZoom);

      zoomSvg.selectAll('circle')
        // @ts-expect-error
        .attr('cx', d => newX(d.price as number))
        // @ts-expect-error
        .attr('cy', d => newY(d.peak_ccu as number));

      zoomSvg.select('.x-axis').call(d3.axisBottom(newX).ticks(10, d3.format('~g')) as any)
        .selectAll('text')
        .style('fill', 'white');

      zoomSvg.select('.y-axis').call(d3.axisLeft(newY).ticks(10, d3.format('~g')) as any)
        .selectAll('text')
        .style('fill', 'white');
    }
  }

  // Add histogram for game release years
  createYearHistogram(data, minYear, maxYear, updateYearFilter);

  function updateYearFilter([newMinYear, newMaxYear]: [number, number]) {
    filteredData = data.filter(d => {
      const year = new Date(d.release_date).getFullYear();
      return d.peak_ccu > 0 && year >= newMinYear && year <= newMaxYear;
    });

    svg.selectAll('circle').remove();
    svg.selectAll('circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.price as number))
      .attr('cy', d => y(d.peak_ccu as number))
      .attr('r', 2.5)
      .style('fill', d => colorScale(d.estimated_owners))
      .style('opacity', 0.5);

    // Also update the zoomed scatter plot
  }
};

