/**
 * Make connections of interaction symmetric within scene.
 * @param {object} scene Scene containing interaction.
 * @param {object} interaction Interaction whose connections were changed.
 */
export const syncNeighbors = (scene, interaction) => {
  const interactions = scene.interactions ?? [];
  const ids = interactions.map((other) => other.id);

  interaction.neighbors = (interaction.neighbors ?? []).filter((id) => id !== interaction.id && ids.includes(id));

  interactions.forEach((other) => {
    if (other.id === interaction.id) {
      return;
    }

    const neighbors = (other.neighbors ?? []).filter((id) => id !== interaction.id);
    if (interaction.neighbors.includes(other.id)) {
      neighbors.push(interaction.id);
    }

    other.neighbors = neighbors;
  });
};

/**
 * Remove interaction from connections of all interactions in scene.
 * @param {object} scene Scene that contained interaction.
 * @param {string} interactionId ID of removed interaction.
 */
export const removeNeighbor = (scene, interactionId) => {
  (scene.interactions ?? []).forEach((interaction) => {
    interaction.neighbors = (interaction.neighbors ?? []).filter((id) => id !== interactionId);
  });
};

/**
 * Create path entries for all connections in scene and drop obsolete ones, keeping custom visuals.
 * @param {object} scene Scene to update paths for.
 */
export const syncPaths = (scene) => {
  const interactions = scene.interactions ?? [];
  const ids = interactions.map((interaction) => interaction.id);
  const isSamePath = (path, from, to) => {
    return (path.from === from && path.to === to) || (path.from === to && path.to === from);
  };

  const pairs = [];
  interactions.forEach((interaction) => {
    (interaction.neighbors ?? []).forEach((neighborId) => {
      const isKnownPair = pairs.some(([from, to]) => isSamePath({ from, to }, interaction.id, neighborId));
      if (ids.includes(neighborId) && !isKnownPair) {
        pairs.push([interaction.id, neighborId]);
      }
    });
  });

  const oldPaths = scene.paths ?? [];
  scene.paths = pairs.map(([from, to]) => {
    return oldPaths.find((path) => isSamePath(path, from, to)) ?? { from, to, visualsType: 'global' };
  });
};
