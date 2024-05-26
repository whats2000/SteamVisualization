import { ScatterPlotData, SteamDataLoader, GameData } from '../../types';

export const createDetailContainer = async (d: ScatterPlotData, dataLoader: SteamDataLoader) => {
  const detailsContainer = document.getElementById('details-container');
  if (detailsContainer) {
    detailsContainer.classList.add('visible');
    detailsContainer.innerHTML = `
      <h3>${d.name}</h3>
      <img src="${d.header_image}" alt="${d.name}" style="max-width: 100%; height: auto;">
      <p>Price: ${d.price}</p>
      <p>Peak CCU: ${d.peak_ccu}</p>
      <p>Estimated Owners: ${d.estimated_owners}</p>
      <p>Release Date: ${d.release_date}</p>
      <p class="loading">Loading additional details...</p>
    `;

    try {
      const gameDetails: GameData = await dataLoader.loadGameDetails(d.game_id);

      // Remove the loading message
      detailsContainer.querySelector('p.loading')?.remove();

      // Append the remaining details once loaded
      detailsContainer.innerHTML += `
        <p>Developers: ${gameDetails.developers.join(', ')}</p>
        <p>Publishers: ${gameDetails.publishers.join(', ')}</p>
        <p>Genres: ${gameDetails.genres.join(', ')}</p>
        <p>Categories: ${gameDetails.categories.join(', ')}</p>
        <p>Metacritic Score: ${gameDetails.metacritic_score}</p>
        <p>User Score: ${gameDetails.user_score}</p>
        <p>Positive Reviews: ${gameDetails.positive}</p>
        <p>Negative Reviews: ${gameDetails.negative}</p>
        <p>Supported Languages: ${gameDetails.supported_languages.join(', ')}</p>
      `;
      detailsContainer.querySelector('p:last-child')?.remove(); // Remove the loading message
    } catch (error) {
      detailsContainer.innerHTML += '<p>Failed to load additional details. Please try again later.</p>';
      console.error(error);
    }
  }
};
