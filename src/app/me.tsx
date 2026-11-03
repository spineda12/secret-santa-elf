import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import { supabase } from "../lib/supabase";

type MeData = {
  name: string;
  wishlist: string;
  event: string;
  target_name: string;
  target_wishlist: string;
};

export default function Me() {
  const { width } = useWindowDimensions();
  const bannerW = Math.min(width - 32, 600);

  const { t } = useLocalSearchParams<{ t: string }>();
  const [data, setData] = useState<MeData | null>(null);
  const [wishlist, setWishlist] = useState("");
  const [status, setStatus] = useState<"loading" | "ok" | "invalid">("loading");
  const [saved, setSaved] = useState(false);

  const load = async () => {
    const { data: res, error } = await supabase.rpc("get_me", { my_token: t });
    if (error || !res) return setStatus("invalid");
    setData(res as MeData);
    setWishlist((res as MeData).wishlist || "");
    setStatus("ok");
  };

  useEffect(() => {
    if (t) load();
    else setStatus("invalid");
  }, [t]);

  const save = async () => {
    setSaved(false);
    const { error } = await supabase.rpc("update_wishlist", {
      my_token: t,
      new_wishlist: wishlist,
    });
    if (!error) setSaved(true);
  };

  if (status === "loading")
    return (
      <View style={s.bg}>
        <View style={[s.card, { margin: 16 }]}>
          <Text>Loading... 🎄</Text>
        </View>
      </View>
    );

  if (status === "invalid" || !data)
    return (
      <View style={s.bg}>
        <View style={[s.card, { margin: 16 }]}>
          <Text>Invalid link 🎄</Text>
        </View>
      </View>
    );

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
        <Text style={s.small}>{data.event}</Text>
        <Text style={s.small}>Hi {data.name}, you're Secret Santa for...</Text>
        <Text style={s.name}>🎁 {data.target_name}</Text>

        <Text style={s.h2}>Their wishlist</Text>
        {data.target_wishlist ? (
          data.target_wishlist.split("\n").map((w, i) => <Text key={i}>• {w}</Text>)
        ) : (
          <Text>They haven't added anything yet. Check back later!</Text>
        )}
        <Pressable style={s.chip} onPress={load}>
          <Text>Refresh</Text>
        </Pressable>

        <Text style={s.h2}>Your wishlist</Text>
        <Text style={{ color: "#666" }}>One item per line. Your Santa will see this.</Text>
        <TextInput
          style={[s.input, { height: 140 }]}
          multiline
          value={wishlist}
          onChangeText={(v) => {
            setWishlist(v);
            setSaved(false);
          }}
          placeholder={"Cozy socks\nChocolate\nA good book"}
        />
        <Pressable style={s.btn} onPress={save}>
          <Text style={s.btnText}>Save wishlist</Text>
        </Pressable>
        {saved && <Text style={{ color: "#1a7f37" }}>Saved ✓</Text>}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#9D231A" },
  scroll: { padding: 16, maxWidth: 700, width: "100%", alignSelf: "center", gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, gap: 8 },
  small: { fontSize: 16 },
  name: { fontSize: 40, fontWeight: "800", color: "#b3001b" },
  h2: { fontSize: 20, fontWeight: "600", marginTop: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, textAlignVertical: "top" },
  btn: { backgroundColor: "#b3001b", padding: 12, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
  chip: { alignSelf: "flex-start", borderWidth: 1, borderColor: "#999", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
});