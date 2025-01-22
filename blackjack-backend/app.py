from flask import Flask, request, jsonify
from flask_cors import CORS
from game_logic import Game


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
game = Game()

@app.route('/api/start', methods=['POST'])
def start():
    try:
        data = request.get_json()
        bet_amount = data.get('betAmount', 0)
        game.start_game(bet_amount)
        return jsonify(game.get_state())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/hit', methods=['POST'])
def hit():
    game.player_hit()
    return jsonify(game.get_state())

@app.route('/api/stand', methods=['POST'])
def stand():
    game.player_stand()
    return jsonify(game.get_state())

@app.route('/api/split', methods=['POST'])
def split():
    game.split()
    return jsonify(game.get_state())

@app.route('/api/double-down', methods=['POST'])
def double_down():
    game.double_down()
    return jsonify(game.get_state())

@app.route('/api/insurance', methods=['POST'])
def insurance():
    response = request.args.get('response')
    game.insurance(response)
    return jsonify(game.get_state())



if __name__ == '__main__':
    app.run(debug=True, port=5000) 