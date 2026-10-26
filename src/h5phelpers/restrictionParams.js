/** @constant {string[]} INTERACTION_RESTRICTION_TYPES Restriction types that reference another interaction. */
export const INTERACTION_RESTRICTION_TYPES = ['interactionScore', 'interactionScorePercentage', 'interactionProgress'];

/**
 * Determine whether restriction references interaction.
 * @param {object} restriction Restriction parameters.
 * @param {string} interactionId ID of interaction.
 * @returns {boolean} True, if restriction references interaction.
 */
const referencesInteraction = (restriction, interactionId) => {
  const type = restriction.restrictionType;
  if (!INTERACTION_RESTRICTION_TYPES.includes(type)) {
    return false;
  }

  return restriction[`${type}Group`]?.[`${type}Id`] === interactionId;
};

/**
 * Remove restrictions that reference interaction from all interactions in scene. Drop sets that become empty.
 * @param {object} scene Scene that contained interaction.
 * @param {string} interactionId ID of removed interaction.
 */
export const removeRestrictionReferences = (scene, interactionId) => {
  (scene.interactions ?? []).forEach((interaction) => {
    const restrictions = interaction.accessRestrictions;
    if (!restrictions?.restrictionSetList) {
      return;
    }

    restrictions.restrictionSetList = restrictions.restrictionSetList
      .map((restrictionSet) => {
        const restrictionList = restrictionSet.restrictionList ?? [];
        const remaining = restrictionList.filter((restriction) => !referencesInteraction(restriction, interactionId));

        return { restrictionSet, wasChanged: remaining.length !== restrictionList.length, remaining };
      })
      .filter(({ wasChanged, remaining }) => !wasChanged || remaining.length > 0)
      .map(({ restrictionSet, remaining }) => ({ ...restrictionSet, restrictionList: remaining }));
  });
};
