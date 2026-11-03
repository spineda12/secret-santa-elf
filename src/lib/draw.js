// exclusions: Set of "idA|idB" strings (stored in both directions)
export function draw(people, exclusions) {
  const ids = people.map(p => p.id);

  for (let attempt = 0; attempt < 5000; attempt++) {
    const receivers = [...ids].sort(() => Math.random() - 0.5);
    const ok = ids.every(
      (giver, i) =>
        giver !== receivers[i] && !exclusions.has(`${giver}|${receivers[i]}`)
    );
    if (ok) return Object.fromEntries(ids.map((g, i) => [g, receivers[i]]));
  }
  return null; // no valid draw possible
}