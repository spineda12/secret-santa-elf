import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { supabase } from "../lib/supabase";

type EventRow = { id: string; name: string; created_at: string; people_count: number };
type PersonRow = { id: string; name: string; token: string };

export default function Events() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [msg, setMsg] = useState("");

  const loadEvents = async () => {
    const { data } = await supabase.rpc("my_events");
    setEvents((data as EventRow[]) || []);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const ok = !!data.session;
      setSignedIn(ok);
      setReady(true);
      if (ok) loadEvents();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
      if (session) loadEvents();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/events` },
    });

  const signOut = async () => {
    await supabase.auth.signOut();
    setEvents([]);
    setPeople([]);
    setOpenId(null);
  };

  const openEvent = async (id: string) => {
    if (openId === id) return setOpenId(null);
    const { data } = await supabase.rpc("my_event_people", { event: id });
    setPeople((data as PersonRow[]) || []);
    setOpenId(id);
    setMsg("");
  };

  const linkFor = (token: string) => `${window.location.origin}/me?t=${token}`;

  const copyLink = async (p: PersonRow) => {
    await navigator.clipboard.writeText(linkFor(p.token));
    setMsg(`Copied ${p.name}'s link`);
  };

  const newLink = async (p: PersonRow) => {
    const { data, error } = await supabase.rpc("reset_token", { person: p.id });
    if (error || !data) return setMsg("Could not make a new link");
    setPeople(people.map((x) => (x.id === p.id ? { ...x, token: data as string } : x)));
    setMsg(`New link made for ${p.name}. The old one no longer works.`);
  };

  if (!ready)
    return (
      <View style={s.bg}>
        <View style={[s.card, { margin: 16 }]}><Text>Loading... 🎄</Text></View>
      </View>
    );

  if (!signedIn)
    return (
      <View style={s.bg}>
        <View style={[s.card, { margin: 16, maxWidth: 500, alignSelf: "center", width: "100%" }]}>
          <Text style={s.h1}>Organizer login</Text>
          <Text>Sign in to see your events and resend lost links.</Text>
          <Pressable style={s.btn} onPress={signIn}>
            <Text style={s.btnText}>Sign in with Google</Text>
          </Pressable>
        </View>
      </View>
    );

  return (
    <ScrollView style={s.bg} contentContainerStyle={s.scroll}>
      <View style={s.card}>
        <Text style={s.h1}>My events</Text>
        {events.length === 0 && (
          <Text>No events yet. Sign in first, then draw names on the home page.</Text>
        )}
        {events.map((e) => (
          <View key={e.id} style={{ gap: 8 }}>
            <Pressable style={s.eventRow} onPress={() => openEvent(e.id)}>
              <Text style={{ fontWeight: "600" }}>{e.name}</Text>
              <Text style={{ color: "#666" }}>{e.people_count} people</Text>
            </Pressable>
            {openId === e.id &&
              people.map((p) => (
                <View key={p.id} style={s.personRow}>
                  <Text style={{ width: 110 }}>{p.name}</Text>
                  <Pressable style={s.chip} onPress={() => copyLink(p)}>
                    <Text>Copy link</Text>
                  </Pressable>
                  <Pressable style={s.chip} onPress={() => newLink(p)}>
                    <Text>New link</Text>
                  </Pressable>
                </View>
              ))}
          </View>
        ))}
        {!!msg && <Text style={{ color: "#1a7f37" }}>{msg}</Text>}
        <Pressable style={s.chip} onPress={signOut}>
          <Text>Sign out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#9D231A" },
  scroll: { padding: 16, maxWidth: 700, width: "100%", alignSelf: "center" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, gap: 12 },
  h1: { fontSize: 26, fontWeight: "700", color: "#b3001b" },
  btn: { backgroundColor: "#b3001b", padding: 12, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
  eventRow: { flexDirection: "row", justifyContent: "space-between", padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8 },
  personRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, paddingLeft: 12 },
  chip: { alignSelf: "flex-start", borderWidth: 1, borderColor: "#999", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
});