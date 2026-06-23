export type BattleHistoryPokemon = {
  artworkUrl: string;
  koName: string;
};

export type HomeBattleHistoryItem = {
  id: string;
  result: 'WIN' | 'DEFEAT';
  opponentName: string;
  floorName: string;
  timeAgo: string;
  deckPokemons: BattleHistoryPokemon[];
};
