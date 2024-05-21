import * as d3 from 'd3';

const loadChunk = async (chunkNumber: number) => {
  const response = await fetch(`./data/chunk_${chunkNumber}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load chunk ${chunkNumber}`);
  }
  return response.json();
};

const loadAllData = async () => {
  const chunkCount = 9;
  const dataPromises = [];
  for (let i = 0; i < chunkCount; i++) {
    dataPromises.push(loadChunk(i));
  }
  const dataArrays = await Promise.all(dataPromises);
  return dataArrays.flat();
};

loadAllData().then(data => {
  console.log(data);
}).catch(error => {
  console.error('Error loading data:', error);
});
