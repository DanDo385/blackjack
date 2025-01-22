# deck.py

import random

class Card:
    suits = ['C', 'D', 'H', 'S']  # Clubs, Diamonds, Hearts, Spades
    ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    values = {'2': 2, '3': 3, '4': 4, '5': 4, '6': 4, '7': 3, '8': 2, '9': 1, '10': 0,
              'J': 0, 'Q': 0, 'K': 0, 'A': -1}  # Hi-Lo card counting values

    def __init__(self, rank, suit):
        if rank in self.ranks and suit in self.suits:
            self.rank = rank
            self.suit = suit
            self.value = self.values[rank]
        else:
            raise ValueError(f"Invalid card: {rank}-{suit}")

    def __repr__(self):
        return f"{self.rank}-{self.suit}.png"

class Deck:
    def __init__(self, num_decks=4):
        self.num_decks = num_decks
        self.build_deck()
        self.shuffle()
        self.running_count = 0

    def build_deck(self):
        self.cards = [Card(rank, suit) for suit in Card.suits for rank in Card.ranks] * self.num_decks
        self.total_cards = len(self.cards)
        self.cards_dealt = 0

    def shuffle(self):
        random.shuffle(self.cards)
        self.cards_dealt = 0
        self.running_count = 0

    def deal(self):
        if self.cards_dealt >= self.total_cards * 0.75:
            self.shuffle()
        self.cards_dealt += 1
        card = self.cards.pop()
        self.update_running_count(card)
        return card

    def update_running_count(self, card):
        self.running_count += card.value

    def get_true_count(self):
        remaining_decks = (self.total_cards - self.cards_dealt) / 52
        return self.running_count / remaining_decks if remaining_decks > 0 else 0
