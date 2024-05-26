import { ScatterPlotData, SteamDataLoader, GameData } from '../../types';
import { createReviewsPlot } from './detailContainer/reviewsPlot';
import { createTagsPlot } from './detailContainer/tagsPlot';

export const createDetailContainer = async (d: ScatterPlotData, dataLoader: SteamDataLoader) => {
  const detailsContainer = document.getElementById('details-container');
  if (detailsContainer) {
    detailsContainer.classList.add('visible');
    detailsContainer.innerHTML = `
      <div class="container-fluid">
        <div class="row mb-3">
          <div class="col-12">
            <h3 class="text-center">${d.name}</h3>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col-12 text-center">
            <img src="${d.header_image}" alt="${d.name}" class="img-fluid">
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <p><strong>Price:</strong> ${d.price}</p>
            <p><strong>Peak CCU:</strong> ${d.peak_ccu}</p>
            <p><strong>Estimated Owners:</strong> ${d.estimated_owners}</p>
            <p><strong>Release Date:</strong> ${d.release_date}</p>
          </div>
          <div class="col-12">
            <p class="loading">Loading additional details...</p>
          </div>
        </div>
        <div class="row">
          <div class="col-12 col-xl-6 d-flex justify-content-center" id="reviews-plot-container"></div>
          <div class="col-12 col-xl-6 d-flex justify-content-center" id="tags-plot-container"></div>
        </div>
      </div>
    `;

    try {
      const gameDetails: GameData = await dataLoader.loadGameDetails(d.game_id);

      // Remove the loading message
      detailsContainer.querySelector('p.loading')?.remove();

      // Append the remaining details once loaded
      detailsContainer.innerHTML += `
        <div class="row mt-2">
          <div class="col-12 col-xl-6">
            <p><strong>Developers:</strong> ${gameDetails.developers.join(', ')}</p>
            <p><strong>Publishers:</strong> ${gameDetails.publishers.join(', ')}</p>
            <p><strong>Genres:</strong> ${gameDetails.genres.join(', ')}</p>
          </div>
          <div class="col-12 col-xl-6">
            <p><strong>Categories:</strong> ${gameDetails.categories.join(', ')}</p>
            <p><strong>Metacritic Score:</strong> ${gameDetails.metacritic_score}</p>
            <p><strong>User Score:</strong> ${gameDetails.user_score}</p>
          </div>
        </div>
        <div class="row">
          <div class="col-12 col-xl-6">
            <p><strong>Positive Reviews:</strong> ${gameDetails.positive}</p>
          </div>
          <div class="col-12 col-xl-6">
            <p><strong>Negative Reviews:</strong> ${gameDetails.negative}</p>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <p><strong>Supported Languages:</strong> ${gameDetails.supported_languages.join(', ')}</p>
          </div>
        </div>
      `;

      // Create reviews plot
      createReviewsPlot(gameDetails);

      // Add tags plot
      createTagsPlot(gameDetails);

    } catch (error) {
      detailsContainer.innerHTML += `
        <div class="row">
          <div class="col-12">
            <p>Failed to load additional details. Please try again later.</p>
          </div>
        </div>
      `;
      console.error(error);
    }
  }
};
