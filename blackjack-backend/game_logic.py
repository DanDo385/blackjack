# game_logic.py 

from deck import Deck, Card

class Game:
    def __init__(self):
        self.deck = Deck()
        self.player_hand = []
        self.dealer_hand = []
        self.game_state = 'betting'
        self.player_split_hands = []
        self.current_bet = 0

    def start_game(self, bet_amount):
        self.current_bet = bet_amount
        self.deck.shuffle()
        self.player_hand = [self.deck.deal()]
        self.dealer_hand = [self.deck.deal(), self.deck.deal()]
        self.game_state = 'player_turn'

    def get_state(self):
        dealer_cards = [
            {'rank': self.dealer_hand[0].rank, 'suit': self.dealer_hand[0].suit},
            {'rank': 'BACK', 'suit': 'BACK'}
        ] if len(self.dealer_hand) > 1 else [
            {'rank': 'BACK', 'suit': 'BACK'},
            {'rank': 'BACK', 'suit': 'BACK'}
        ]
        
        return {
            'playerHand': [{'rank': card.rank, 'suit': card.suit} for card in self.player_hand],
            'dealerHand': dealer_cards,
            'gameState': self.game_state,
            'count': self.deck.running_count,
            'trueCount': self.deck.get_true_count(),
            'currentBet': self.current_bet
        }

    def player_hit(self):
        if self.game_state == 'player_turn':
            self.player_hand.append(self.deck.deal())
            if self.calculate_hand_value(self.player_hand) > 21:
                self.game_state = 'resolution'  # Player busts

    def player_stand(self):
        if self.game_state == 'player_turn':
            self.game_state = 'dealer_turn'
            self.dealer_play()

    def player_double_down(self):
        if self.game_state == 'player_turn' and len(self.player_hand) == 2:
            self.player_hand.append(self.deck.deal())
            # Double the player's bet here (not shown in code)
            if self.calculate_hand_value(self.player_hand) > 21:
                self.game_state = 'resolution'  # Player busts
            else:
                self.game_state = 'dealer_turn'
                self.dealer_play()

    def player_split(self):
        if self.game_state == 'player_turn' and len(self.player_hand) == 2 and self.player_hand[0].rank == self.player_hand[1].rank:
            self.player_split_hands = [[self.player_hand[0]], [self.player_hand[1]]]
            self.player_split_hands[0].append(self.deck.deal())
            self.player_split_hands[1].append(self.deck.deal())
            # Handle each split hand separately (not fully implemented here)

    def dealer_play(self):
        if self.game_state == 'dealer_turn':
            while self.calculate_hand_value(self.dealer_hand) < 17:
                self.dealer_hand.append(self.deck.deal())
            self.game_state = 'resolution'

    def calculate_hand_value(self, hand):
        value = 0
        aces = 0
        for card in hand:
            if card.rank == 'A':
                aces += 1
            value += min(card.value, 10)  # Face cards are worth 10
        while aces > 0:
            if value + 10 <= 21:
                value += 10
            aces -= 1
        return value

    def resolve_game(self):
        player_value = self.calculate_hand_value(self.player_hand)
        dealer_value = self.calculate_hand_value(self.dealer_hand)
        if player_value > 21:
            return "Player busts, dealer wins!"
        elif dealer_value > 21:
            return "Dealer busts, player wins!"
        elif player_value > dealer_value:
            return "Player wins!"
        elif player_value < dealer_value:
            return "Dealer wins!"
        else:
            return "It's a draw!"

# Additional methods for other player actions and game logic
