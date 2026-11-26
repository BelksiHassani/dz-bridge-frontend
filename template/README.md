# DZ-Expertise: template without sample data

The same pages as the parent folder (except `index.html` and `expert.html`, which are not included), with all example data removed. Every list, table and card starts empty and shows its empty state until the API is connected.

## What was removed

| Page | Removed |
|---|---|
| `expert-dashboard.html` | Opportunities, availability, experts, threads, feedback, activity, KPIs, institutions list, the hard-coded expert name, scripted message replies |
| `org-dashboard.html` | Institution details, team, projects, expert pool, events, threads, feedback, sample KPI texts ("+2 this quarter", "7.2 d"), scripted replies |
| `admin-dashboard.html` | Hard-coded admin and expert names, sample NPS figures (it was already an empty template) |
| `events-data.js` | All sample events (`SAMPLE=[]`) |
| `homepage.html`, `events.html`, `event.html` | Sample event cards; empty states added |
| `expert-profile.html` | The fake CV / LinkedIn / Google Scholar import (it now keeps only the links pasted) and the sample expert ID |
| `org-profile.html` | The fallback account (name, email) and sample placeholders |
| `login.html`, `signup.html` | Demo accounts. Sign up first, then log in with that account |

Names now come from the account created on `signup.html`.

## Kept

Reference lists (wilayas, domains, skills, languages, fees), interface text, illustrations, partner logos and the matching-rule defaults.

## Browser storage

These pages use the `dzt-` prefix for browser storage (the originals use `dzb-`), so data saved while using one version never shows up in the other. Language and theme (`dzb-lang`, `dzb-theme`) are shared.
