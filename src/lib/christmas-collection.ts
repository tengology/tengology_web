// A seasonal selection across existing collections; products keep their home collection.
export const CHRISTMAS_COLLECTION_FILTER = {
  OR: [
    { collection: { in: ["Christmas", "Reindeer Ears", "Deer Ears", "Ornaments"] } },
    { slug: { in: [
      "holly-berry-bow-felt-headband",
      "golden-berry-bow-felt-headband",
      "holly-rose-faux-fur-claw-clip",
      "festive-berry-felt-headband",
    ] } },
  ],
};
