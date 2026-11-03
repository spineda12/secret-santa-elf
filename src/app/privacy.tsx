import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Privacy() {
  return (
    <ScrollView style={s.bg} contentContainerStyle={s.scroll}>
      <View style={s.card}>
        <Text style={s.h1}>Privacy Policy</Text>
        <Text style={s.p}>Secret Santa Elf is a small app for organizing gift exchanges among friends and family.</Text>

        <Text style={s.h2}>What we collect</Text>
        <Text style={s.p}>
          Organizers who sign in with Google share their name and email address with us. This is used only to log them in and show them their own events.
        </Text>
        <Text style={s.p}>
          Organizers enter participants' first names, and participants can add a wishlist. We store this so each person can see their assignment and wishlist through their private link.
        </Text>

        <Text style={s.h2}>How we use it</Text>
        <Text style={s.p}>
          Your information is used only to run the Secret Santa event. We do not sell it, share it with advertisers, or use it for anything else.
        </Text>

        <Text style={s.h2}>Where it is stored</Text>
        <Text style={s.p}>Data is stored securely with Supabase and the site is hosted on Vercel.</Text>

        <Text style={s.h2}>Deleting your data</Text>
        <Text style={s.p}>To have your data deleted, email silviaap316@gmail.com and we will remove it.</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#9D231A" },
  scroll: { padding: 16, maxWidth: 700, width: "100%", alignSelf: "center" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, gap: 8 },
  h1: { fontSize: 28, fontWeight: "700", color: "#b3001b" },
  h2: { fontSize: 18, fontWeight: "600", marginTop: 12 },
  p: { fontSize: 15, lineHeight: 22 },
});