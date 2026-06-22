export type TrainerSummary = {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
  cardPackCount: number;
  battleRecord: {
    wins: number;
    losses: number;
  };
  ownedPokemonCount: number;
  activeDeckDexIds: number[];
  currentFloor: number;
};
