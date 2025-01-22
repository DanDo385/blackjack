from flask import Flask, request, jsonify
from game_logic import Game

app = Flask(__name__)
game = Game()

@app.route('/api/stand', methods=['POST'])
def stand():
    game.stand()
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

@app.route('/api/hit', methods=['POST'])
def hit():
    game.hit()
    return jsonify(game.get_state())

if __name__ == '__main__':
    app.run(debug=True) 