import requests
from flask import jsonify, Blueprint, request
from sqlalchemy.exc import OperationalError

from .models import Game

bp = Blueprint('main', __name__)


@bp.route('/api/check_database', methods=['GET'])
def check_database():
    return jsonify({'status': 'offline'})

    # TODO: Remove this after fixing the database
    try:
        Game.query.first()
        return jsonify({'status': 'online'})
    except OperationalError:
        return jsonify({'status': 'offline'})


@bp.route('/api/games_price_peak_ccu', methods=['GET'])
def get_games():
    # TODO: Remove this limit
    limit = request.args.get('limit')
    if limit:
        games = Game.query.limit(limit).all()
    else:
        games = Game.query.all()
    games_list = []
    for game in games:
        games_list.append({
            'game_id': game.game_id,
            'name': game.name,
            'release_date': game.release_date,
            'price': game.price,
            'header_image': game.header_image,
            'peak_ccu': game.peak_ccu,
            'estimated_owners': game.estimated_owners,
        })
    return jsonify(games_list)


@bp.route('/api/game_details/<game_id>', methods=['GET'])
def get_game_details(game_id):
    game = Game.query.filter_by(game_id=game_id).first()
    if game:
        return jsonify({
            'game_id': game.game_id,
            'name': game.name,
            'release_date': game.release_date,
            'price': game.price,
            'header_image': game.header_image,
            'peak_ccu': game.peak_ccu,
            'estimated_owners': game.estimated_owners,
            'developer': game.developer,
            'publisher': game.publisher,
            'genres': game.genres,
            'tags': game.tags,
            'categories': game.categories,
            'description': game.description,
            'about': game.about,
            'short_description': game.short_description,
            'reviews': game.reviews,
            'languages': game.languages,
            'system_requirements': game.system_requirements,
            'platforms': game.platforms,
            'website': game.website,
            'background_image': game.background_image,
            'screenshots': game.screenshots,
            'movies': game.movies,
            'demos': game.demos,
            'dlc': game.dlc,
            'packages': game.packages,
            'metacritic': game.metacritic,
            'recommendations': game.recommendations,
            'achievements': game.achievements
        })


@bp.route('/api/game_recommendations/<game_id>', methods=['GET'])
def get_game_recommendations(game_id):
    try:
        response = requests.get(f'https://store.steampowered.com/appreviewhistogram/{game_id}')

        response.raise_for_status()
        data = response.json()
        return jsonify(data)
    except requests.RequestException as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/game_timeline', methods=['GET'])
def get_game_timeline():
    games = Game.query.all()

    # TODO: Change this to the actual timeline needed for the frontend
    games_list = []
    for game in games:
        games_list.append({
            'game_id': game.game_id,
            'name': game.name,
            'price': game.price,
            'peak_ccu': game.peak_ccu,
            'release_date': game.release_date,
        })

    return jsonify(games_list)


# Register blueprint
def register_blueprints(app):
    app.register_blueprint(bp)
