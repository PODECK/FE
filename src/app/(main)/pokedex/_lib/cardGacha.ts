export type GachaPokemon = {
  dexId: number;
  koName: string;
};

export type GachaCard = {
  pokemon: GachaPokemon;
  isNew: boolean;
};
