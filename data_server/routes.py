from flask import jsonify, Blueprint, request
from sqlalchemy.exc import OperationalError

from .modals import Game

bp = Blueprint('main', __name__)


@bp.route('/api/check_database', methods=['GET'])
def check_database():
    try:
        Game.query.first()
        return jsonify({'status': 'online'})
    except OperationalError:
        return jsonify({'status': 'offline'})


@bp.route('/api/games_price_peak_ccu', methods=['GET'])
def get_games():
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
            'price': game.price,
            'header_image': game.header_image,
            'peak_ccu': game.peak_ccu,
        })
    return jsonify(games_list)


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
