import * as d3 from 'd3';
import { SteamDataLoader } from '../../../types';

export const createRecommendationPlot = async (dataLoader: SteamDataLoader, gameId: string) => {
  // Fetch the data
  const recommendationData = await dataLoader.getRecentlyRecommendation(gameId);
  if (!recommendationData) {
    console.log('Failed to load recommendation data');

    // Hide the spinner
    hideSpinner();

    return;
  }

  // Define the dimensions and margins for the plots
  const margin = { top: 40, right: 30, bottom: 20, left: 60 };
  const width = 1100 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  // Create the first plot for overall recommendations
  createPlot('#recommendations-plot-container', recommendationData.results.rollups, 'Overall Recommendations', margin, width / 2, height);

  // Create the second plot for recent recommendations
  createPlot('#recommendations-plot-container-2', recommendationData.results.recent, 'Recent Recommendations', margin, width / 2, height);

  // Hide the spinner
  hideSpinner();

  function hideSpinner() {
    const recommendationSpinner = document.getElementById('recommendation-loading-container');
    if (recommendationSpinner) {
      recommendationSpinner.style.display = 'none';
    }
  }

  function createPlot(containerId: string, data: any[], title: string, margin: { top: number, right: number, bottom: number, left: number }, plotWidth: number, plotHeight: number) {
    // Clear the svg if it already exists
    d3.select(containerId + ' svg').remove();

    // Append the svg object to the body of the page
    const svg = d3.select(containerId)
      .append('svg')
      .attr('width', plotWidth + margin.left + margin.right)
      .attr('height', plotHeight + margin.top + margin.bottom + 40) // Increase the height to accommodate the legend and title
      .attr('class', 'fade-in')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Process the data
    const processedData = data.map(d => ({
      date: new Date(d.date * 1000),
      recommendations_up: d.recommendations_up,
      recommendations_down: d.recommendations_down,
    }));

    // Add X axis
    const x = d3.scaleTime()
      .domain([
        d3.min(processedData, d => d.date) as Date,
        d3.max(processedData, d => d3.timeDay.offset(d.date, 1)) as Date // Extend the domain by one day to avoid clipping
      ])
      .range([0, plotWidth]);
    svg.append('g')
      .attr('transform', `translate(0,${plotHeight})`)
      .call(d3.axisBottom(x));

    // Add Y axis for recommendations up and down
    const y = d3.scaleLinear()
      .domain([
        -(d3.max(processedData, d => Math.max(d.recommendations_up, d.recommendations_down)) as number),
        d3.max(processedData, d => Math.max(d.recommendations_up, d.recommendations_down)) as number
      ])
      .range([plotHeight, 0]);

    svg.append('g')
      .call(d3.axisLeft(y));

    // Calculate bar width
    const barWidth = plotWidth / processedData.length;

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('padding', '5px')
      .style('border-radius', '5px')
      .style('box-shadow', '0 0 10px rgba(0,0,0,0.5)');

    // Add bars for recommendations up
    svg.selectAll('.bar-up')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('class', 'bar-up')
      .attr('x', d => x(d.date))
      .attr('y', d => y(d.recommendations_up))
      .attr('width', barWidth - 1)
      .attr('height', d => plotHeight / 2 - y(d.recommendations_up))
      .attr('fill', 'steelblue')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', 'lightblue');
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br/>Recommendations Up: ${d.recommendations_up}`)
          .style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', 'steelblue');
        tooltip.transition().duration(500).style('opacity', 0);
      });

    // Add bars for recommendations down
    svg.selectAll('.bar-down')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('class', 'bar-down')
      .attr('x', d => x(d.date))
      .attr('y', plotHeight / 2) // Start from the middle
      .attr('width', barWidth - 1)
      .attr('height', d => y(-d.recommendations_down) - plotHeight / 2) // Extend height downwards
      .attr('fill', 'brown')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', 'lightcoral');
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br/>Recommendations Down: ${d.recommendations_down}`)
          .style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', 'brown');
        tooltip.transition().duration(500).style('opacity', 0);
      });

    // Add title at the top
    svg.append('text')
      .attr('x', plotWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);

    // Add color legend at the bottom
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(95, ${plotHeight + margin.bottom + 10})`);

    // Add legend for recommendations up
    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', 'steelblue');

    legend.append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('fill', 'white')
      .text('Recommendations Up');

    // Add legend for recommendations down
    legend.append('rect')
      .attr('x', 200)
      .attr('y', 0)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', 'brown');

    legend.append('text')
      .attr('x', 224)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('fill', 'white')
      .text('Recommendations Down');

    // Add the fade-in class to the svg
    d3.select(containerId + ' svg').classed('visible', true);
  }
};
