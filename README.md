# GameVis

## A Steam Game Data Visualization Project

This project visualizes Steam game data using a combination of front-end and back-end technologies. 

## Demo (Without Backend)
Website: [GitPage](https://whats2000.github.io/SteamVisualization/)

## Prerequisites

- **Node.js**: Make sure you have Node.js installed. You can download it from [Node.js](https://nodejs.org/).
- **Yarn**: Yarn is used for package management. Install it globally using:
  ```bash
  npm install -g yarn
  ```
- **Conda**: Ensure you have Conda installed. You can download it from [Anaconda](https://www.anaconda.com/products/distribution) or [Miniconda](https://docs.conda.io/en/latest/miniconda.html).

## Setup Instructions

### Clone the Repository

1. Clone the repository from GitHub:
   ```bash
   git clone https://github.com/whats2000/SteamVisualization.git
   cd SteamVisualization
   ```

### Backend Setup

1. Create a Conda environment with Python 3.11:
   ```bash
   conda create -n steam-visualization python=3.11
   ```

2. Activate the Conda environment:
   ```bash
   conda init bash
   conda activate steam-visualization
   ```

3. Install the dependencies using pip:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   python run.py
   ```

### Frontend Setup

1. Open another terminal window of the project directory.

2. Navigate to the `d3-ts-website` directory:
   ```bash
   cd d3-ts-website
   ```

3. Install the dependencies using Yarn:
   ```bash
   yarn
   ```

4. Start the front-end development server:
   ```bash
   yarn start
   ```

## Project Structure

```
SteamVisualization
│
├── .github
├── create_database
├── d3-ts-website
│   ├── dist
│   ├── node_modules
│   ├── src
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.js
│   ├── yarn.lock
├── data_analysis
├── data_server
│   ├── __init__.py
│   ├── models.py
│   ├── routes.py
├── raw_data
│   ├── games_march2025_cleaned.csv
├── script
│   ├── analyze_and_merge_data.py
├── .gitattributes
├── .gitignore
├── .prettierignore
├── .prettierrc.yaml
├── config.py
├── LICENSE
├── README.md
├── requirements.txt
└── run.py
```

## Usage

Once both the frontend and backend servers are running, open your browser and navigate to `http://localhost:8080/` to view the application.

## Dataset Reference

This project uses Steam game data from multiple sources, merged into a comprehensive dataset:

### Current Data Source (March 2025)
- **Primary Source**: [Steam Games Dataset by artermiloff](https://www.kaggle.com/datasets/artermiloff/steam-games-dataset)
- **Last Updated**: March 2025
- **Total Games**: ~107,866 games
- **Data Split**: 20 JSON chunks for progressive loading

### Previous Data Source
- **Original Source**: [Steam Games Dataset by FronKongames](https://www.kaggle.com/datasets/fronkongames/steam-games-dataset)
- Historical data merged with current source to preserve older game information

### About the Dataset

These datasets are created using the Steam API and SteamSpy API. The data includes game metadata, statistics, pricing, player counts, reviews, and more.

### Updating the Dataset

To merge new data:
1. Place the new CSV file in `raw_data/` directory
2. Run analysis: `python script/analyze_and_merge_data.py`
3. Run merge: `python script/analyze_and_merge_data.py --merge`

The merge process preserves all existing game data and updates with new information where available.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
