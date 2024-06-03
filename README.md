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

3. Navigate to the project root directory and install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   python run.py
   ```

### Frontend Setup

1. Navigate to the `d3-ts-website` directory:
   ```bash
   cd d3-ts-website
   ```

2. Install the dependencies using Yarn:
   ```bash
   yarn
   ```

3. Start the front-end development server:
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

This project uses the [Steam Games Dataset](https://www.kaggle.com/datasets/fronkongames/steam-games-dataset) from Kaggle.

### About the Dataset

This dataset has been created with this code (MIT) and uses the API provided by Steam, the largest gaming platform on PC. Data is also collected from Steam Spy.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
