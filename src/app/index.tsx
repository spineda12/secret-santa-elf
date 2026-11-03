import { Link } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { draw } from "../lib/draw";
import { supabase } from "../lib/supabase";

type Person = { id: string; name: string };
type Link = { name: string; url: string };

export default function Home() {
  const { width } = useWindowDimensions();
  const bannerW = Math.min(width - 32, 600);
  const [eventName, setEventName] = useState("Family Secret Santa");
  const [people, setPeople] = useState<Person[]>([]);
  const [name, setName] = useState("");
  const [excl, setExcl] = useState<Set<string>>(new Set());
  const [links, setLinks] = useState<Link[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addPerson = () => {
    if (!name.trim()) return;
    setPeople([...people, { id: Date.now().toString(), name: name.trim() }]);
    setName("");
  };

  const removePerson = (id: string) => {
    setPeople(people.filter((p) => p.id !== id));
    setExcl(new Set([...excl].filter((k) => !k.split("|").includes(id))));
  };

  // mark/unmark a "can't draw each other" pair (both directions)
  const toggleExcl = (a: string, b: string) => {
    const next = new Set(excl);
    const has = next.has(`${a}|${b}`);
    [`${a}|${b}`, `${b}|${a}`].forEach((k) => (has ? next.delete(k) : next.add(k)));
    setExcl(next);
  };

  const runDraw = async () => {
    setError("");
    setLinks([]);
    if (people.length < 3) return setError("Add at least 3 people.");

    const result = draw(people, excl);
    if (!result) return setError("No valid draw with these exceptions. Remove some and retry.");

    setLoading(true);
    const { data, error: err } = await supabase.rpc("create_event", {
      event_name: eventName,
      people_input: people.map((p) => ({ key: p.id, name: p.name, wishlist: "" })),
      assignments: result,
    });
    setLoading(false);

    if (err) return setError("Could not save: " + err.message);

    setLinks(
      (data as { name: string; token: string }[]).map((p) => ({
        name: p.name,
        url: `${window.location.origin}/me?t=${p.token}`,
      }))
    );
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <ScrollView style={s.bg} contentContainerStyle={s.scroll}>
            <Image
        source={require("../../assets/images/background.jpg")}
        style={{
          width: bannerW,
          height: (bannerW * 1024) / 1409,
          borderRadius: 16,
          alignSelf: "center",
        }}
        resizeMode="contain"
      />

      <View style={s.card}>
          <Link href="/events" style={{ color: "#b3001b", fontWeight: "600" }}>
          Organizer login / My events →
        </Link>
        <Text style={s.h2}>1. Event name</Text>
        <TextInput style={s.input} value={eventName} onChangeText={setEventName} />

        <Text style={s.h2}>2. Add people</Text>
        <View style={s.row}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            onSubmitEditing={addPerson}
          />
          <Pressable style={s.btn} onPress={addPerson}>
            <Text style={s.btnText}>Add</Text>
          </Pressable>
        </View>
        {people.map((p) => (
          <View key={p.id} style={s.row}>
            <Text>• {p.name}</Text>
            <Pressable onPress={() => removePerson(p.id)}>
              <Text style={{ color: "crimson" }}> ✕</Text>
            </Pressable>
          </View>
        ))}

        {people.length > 1 && (
          <>
            <Text style={s.h2}>3. Can't draw each other (couples etc.)</Text>
            <Text style={{ color: "#666" }}>Tap a name to mark it. Green means excluded.</Text>
            {people.map((a) => (
              <View key={a.id} style={s.row}>
                <Text style={{ width: 90 }}>{a.name}:</Text>
                {people
                  .filter((b) => b.id !== a.id)
                  .map((b) => {
                    const on = excl.has(`${a.id}|${b.id}`);
                    return (
                      <Pressable
                        key={b.id}
                        onPress={() => toggleExcl(a.id, b.id)}
                        style={[s.chip, on && s.chipOn]}
                      >
                        <Text style={{ color: on ? "#fff" : "#333" }}>{b.name}</Text>
                      </Pressable>
                    );
                  })}
              </View>
            ))}

            <Pressable
              style={[s.btn, { marginTop: 20 }, loading && { opacity: 0.6 }]}
              onPress={runDraw}
              disabled={loading}
            >
              <Text style={s.btnText}>{loading ? "Drawing..." : "4. Draw names 🎁"}</Text>
            </Pressable>
          </>
        )}

        {!!error && <Text style={{ color: "crimson" }}>{error}</Text>}

        {links.length > 0 && (
          <>
            <Text style={s.h2}>Send each person their private link</Text>
            <Text style={{ color: "#666" }}>
              Copy these now. They aren't shown again after you leave this page. Don't open them
              yourself, or you'll see who you drew.
            </Text>
            {links.map((l) => (
              <View key={l.name} style={s.row}>
                <Text style={{ width: 90 }}>{l.name}</Text>
                <Pressable style={s.chip} onPress={() => copy(l.url)}>
                  <Text>Copy link</Text>
                </Pressable>
              </View>
            ))}
            <Pressable
              style={s.btn}
              onPress={() => copy(links.map((l) => `${l.name}: ${l.url}`).join("\n"))}
            >
              <Text style={s.btnText}>Copy all links</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#9D231A" },
  scroll: { padding: 16, maxWidth: 700, width: "100%", alignSelf: "center", gap: 12 },
  banner: { width: "100%", maxWidth: 600, height: undefined, aspectRatio: 1409 / 800, borderRadius: 16, alignSelf: "center", marginBottom: -8 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, gap: 10 },
  h2: { fontSize: 20, fontWeight: "600", marginTop: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  btn: { backgroundColor: "#b3001b", padding: 12, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  chip: { borderWidth: 1, borderColor: "#999", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipOn: { backgroundColor: "#1a7f37", borderColor: "#1a7f37" },
});