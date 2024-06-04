import * as d3 from 'd3';
import { ScatterPlotData, SteamDataLoader } from '../../types';
import { createDetailContainer } from './detailContainer';

export const createZoomPlot = (
  filteredData: ScatterPlotData[],
  activeLegend: string | null,
  currentBrushExtent: [[number, number], [number, number]],
  currentScaleType: 'linear' | 'symlog',
  x: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  colorScale: d3.ScaleSequential<string>,
  ownerRanges: string[],
  dataLoader: SteamDataLoader,
  width: number,
  height: number,
  selectedPoint: ScatterPlotData | null,
  margin: { top: number; right: number; bottom: number; left: number },
  updateZoomCircles: (zoomedCircles: d3.Selection<SVGCircleElement, ScatterPlotData, SVGGElement, unknown>) => void,
  hasShownAlert: boolean,
  updateSelectedPoint: (value: ScatterPlotData | null) => void,
  updateHasShownAlert: (value: boolean) => void,
) => {
  const [[x0, y0], [x1, y1]] = currentBrushExtent;

  // Tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('padding', '5px')
    .style('border-radius', '5px')
    .style('box-shadow', '0 0 10px rgba(0,0,0,0.5)');

  // Create new scales for a zoomed region
  const xZoom = currentScaleType === 'linear' ?
    d3.scaleLinear()
      .domain([x.invert(x0), x.invert(x1)])
      .range([0, width]) :
    d3.scaleSymlog()
      .domain([x.invert(x0), x.invert(x1)])
      .range([0, width]);

  const yZoom = currentScaleType === 'linear' ?
    d3.scaleLinear()
      .domain([y.invert(y1), y.invert(y0)])
      .range([height, 0]) :
    d3.scaleSymlog()
      .domain([y.invert(y1), y.invert(y0)])
      .range([height, 0]);

  // Remove existing zoomed svg
  d3.select('#zoom-container').select('g').remove();

  // Append new zoomed svg group
  const zoomSvgGroup = d3.select('#zoom-container')
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const zoomedData = filteredData.filter(d =>
    x(d.price) >= x0 &&
    x(d.price) <= x1 &&
    y(d.peak_ccu) >= y0 &&
    y(d.peak_ccu) <= y1,
  );

  // Show a bootstrap info alert if there is no data in the zoomed area
  if (zoomedData.length === 0 && !hasShownAlert) {
    updateHasShownAlert(true);
    d3.select('#visualization-container-2')
      .append('div')
      .attr('id', 'no-data-alert')
      .attr('class', 'border rounded-5 p-5 position-absolute top-50 start-50 translate-middle')
      .html(`
        <h4 class="alert-heading">No data captured</h4>
        <p>Please use the brush tool on the left plot to select an area to zoom in.</p>
      `);
    return;
  } else if (zoomedData.length > 0) {
    const alert = document.getElementById('no-data-alert');
    if (alert) {
      alert.classList.add('fade-out');
      setTimeout(() => alert.remove(), 1000);
    }
  }

  // Add zoomed dots
  const zoomedCircles = zoomSvgGroup.append('g')
    .selectAll('circle')
    .data(zoomedData).enter()
    .append('circle')
    .attr('cx', d => xZoom(d.price as number))
    .attr('cy', d => yZoom(d.peak_ccu as number))
    .attr('r', d => (d === selectedPoint ? 7 : 5))
    .style('fill', d =>
      d === selectedPoint ? 'white' :
        colorScale(ownerRanges.indexOf(d.estimated_owners)),
    ).style('opacity', d =>
      (activeLegend && d.estimated_owners !== activeLegend) ? 0.01 : 0.5,
    ).on('mouseover', function(event, d) {
      if (d !== selectedPoint) {
        d3.select(this).attr('r', 7).style('fill', 'white');
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`Name: ${d.name}<br/>` +
          `Price: ${d.price}<br/>` +
          `Peak CCU: ${d.peak_ccu}<br/>` +
          `Estimated Owners: ${d.estimated_owners}`,
        )
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      }
    })
    .on('mouseout', function(_event, d) {
      tooltip.transition().duration(500).style('opacity', 0);

      if (d === selectedPoint) {
        d3.select(this).style('fill', 'white');
        return;
      }
      (d3.select(this) as unknown as d3.Selection<SVGCircleElement, ScatterPlotData, SVGGElement, unknown>)
        .attr('r', 5)
        .style('fill', (
          (d: ScatterPlotData) => colorScale(ownerRanges.indexOf(d.estimated_owners))),
        );
    })
    .on('click', async function(_event, d) {
      if (selectedPoint) {
        d3.select(this)
          .style('fill', colorScale(ownerRanges.indexOf(selectedPoint.estimated_owners)))
          .style('opacity', 0.5);
      }
      selectedPoint = d;
      updateSelectedPoint(d);
      (d3.selectAll('#zoom-container circle') as unknown as d3.Selection<SVGCircleElement, ScatterPlotData, SVGGElement, unknown>)
        .attr('r', 5)
        .style('opacity', d => (activeLegend && d.estimated_owners !== activeLegend) ? 0.01 : 0.5)
        .style('fill', (
          (d: ScatterPlotData) => d === selectedPoint ? 'white' : colorScale(ownerRanges.indexOf(d.estimated_owners))),
        );
      d3.select(this).attr('r', 7).style('opacity', 1);

      await createDetailContainer(d, dataLoader);
    });

  // Add zoomed X axis
  zoomSvgGroup.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xZoom).ticks(5))
    .selectAll('text')
    .style('fill', 'white')
    .attr('font-size', '12px');

  // Add zoomed Y axis
  zoomSvgGroup.append('g')
    .call(d3.axisLeft(yZoom).ticks(5, d3.format('~g')))
    .selectAll('text')
    .style('fill', 'white')
    .attr('font-size', '12px');

  // Add zoomed title
  zoomSvgGroup.append('text')
    .attr('x', width / 2)
    .attr('y', margin.top - 65)
    .attr('text-anchor', 'middle')
    .style('fill', 'white')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text('Zoomed Area (Click on a point for more details)');

  updateZoomCircles(zoomedCircles);

  // Add summary statistics
  const summaryGroup = zoomSvgGroup.append('g')
    .attr('transform', `translate(${width + 18}, 10)`);

  const avgPrice = d3.mean(zoomedData, d => d.price) || 0;
  const avgPeakCCU = d3.mean(zoomedData, d => d.peak_ccu) || 0;
  const count = zoomedData.length;

  summaryGroup.append('text')
    .attr('y', 0)
    .style('fill', 'white')
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .text(`Summary Statistics`);

  summaryGroup.append('text')
    .attr('y', 20)
    .style('fill', 'white')
    .style('font-size', '12px')
    .text(`Avg. Price: $${avgPrice.toFixed(2)}`);

  summaryGroup.append('text')
    .attr('y', 40)
    .style('fill', 'white')
    .style('font-size', '12px')
    .text(`Avg. Peak CCU: ${Math.round(avgPeakCCU)}`);

  summaryGroup.append('text')
    .attr('y', 60)
    .style('fill', 'white')
    .style('font-size', '12px')
    .text(`Count: ${count}`);
};
