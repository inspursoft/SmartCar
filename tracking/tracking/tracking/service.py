from flask import (
    Blueprint, current_app, jsonify
)
from tracking import move

bp = Blueprint('service', __name__, url_prefix="/api/v1")

@bp.route('/position')
def get_car_position():
    data = {
        "index": move.index % len(move.nodes),
        "position": move.nodes[move.index % len(move.nodes)],
        "status": move.status
    }
    return jsonify(data)
