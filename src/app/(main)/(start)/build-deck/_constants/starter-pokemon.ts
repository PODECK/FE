export const starterPokemonIdsByGeneration = {
  1: [1, 4, 7],
  2: [152, 155, 158],
  3: [252, 255, 258],
  4: [387, 390, 393],
} as const;

export const generationTabs = [
  { generation: 1, label: '1세대' },
  { generation: 2, label: '2세대' },
  { generation: 3, label: '3세대' },
  { generation: 4, label: '4세대' },
] as const;
