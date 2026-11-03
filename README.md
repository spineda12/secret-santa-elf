# 🎅 Secret Santa Elf

A Secret Santa web app where **participants never need an account**. The organizer adds names and "can't draw each other" exceptions (like couples), draws, and sends each person a private link. Each person sees who they're buying for and can edit their own wishlist.

**Live demo:** https://dist-psi-weld-ym950itwhi.vercel.app

![Secret Santa Elf banner](assets/images/background.jpg)

## Features

- Draw names with exclusions, so couples never draw each other
- Private link per person, with no sign-up or password
- Each person edits their own wishlist, and their Santa sees updates
- Responsive design that works on phones and desktops

## Tech stack

- **Expo + React Native (web)** with Expo Router and TypeScript
- **Supabase** (Postgres) for storage
- **Vercel** for hosting

## How it works

1. The organizer enters names and exclusions in the browser.
2. A constrained shuffle runs client-side. It retries until no one draws themselves or an excluded person.
3. The result is saved through a Postgres function (`create_event`), which returns a random secret token for each person.
4. Each person opens `/me?t=TOKEN`. The token identifies them, with no login.

## Security design

- Row Level Security is enabled on all tables with **no public policies**, so the public key can't read the data directly.
- All access goes through three `SECURITY DEFINER` functions (`create_event`, `get_me`, `update_wishlist`) that require a valid token.
- Tokens are 128-bit random values, so links can't be guessed.
- The app never shows the organizer who drew whom.

## Run locally

```bash
git clone https://github.com/spineda12/secret-santa-elf.git
cd secret-santa-elf
npm install
```

Create a `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_KEY=your-publishable-key
```

Create the tables and functions in your Supabase project (SQL editor), then:

```bash
npx expo start --web
```

## Roadmap

- [ ] Organizer login (Google) with a "My events" dashboard and link resend
- [ ] Custom domain
- [ ] Price limit and event date

## Author

Silvia Pineda · [GitHub](https://github.com/spineda12)