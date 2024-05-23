from flask import jsonify, Blueprint, request
from .models import Game

bp = Blueprint('main', __name__)

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
            'peak_ccu': game.peak_ccu,
        })
    return jsonify(games_list)

# Register blueprint
def register_blueprints(app):
    app.register_blueprint(bp)
