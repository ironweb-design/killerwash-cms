# Killer Wash + Decap CMS (sandbox)

This is a practice copy of the Killer Wash site wired up so the client can edit
prices, contact info, and reviews from a simple admin panel, without touching code.
Your design, sliders, router, form, and GA4 are all untouched.

## What changed vs the original single file

- The one big `index.html` is now built by **Eleventy** from `src/index.njk`.
- CSS moved to `assets/styles.css`, the app JS to `assets/app.js`.
- The logo (previously a base64 blob repeated 4 times) is now `assets/logo.jpg`.
- The editable values live in `src/_data/site.json`. The template reads from there.
- `admin/` is the **Decap CMS** panel, configured to expose ONLY the safe fields.

## What the client can edit (and nothing else)

- Business info: phone, email, serving area, hours, quote starting price
- Trash bin prices, car wash prices
- Google and Facebook reviews (add / edit / remove)

Everything else (layout, animations, sliders, images) stays yours.

## First: put the real images back

Drop the client's actual photo files into `src/images/` (see the list in
`src/images/README.txt`). They copy to the site root on build.

## Run it locally (see it work before deploying)

```
npm install
npm run build      # outputs the finished site to _site/
npm start          # live preview at http://localhost:8080
```

### Try the CMS locally without any login

1. In `admin/config.yml`, uncomment the line `local_backend: true`.
2. In one terminal: `npx decap-server`
3. In another: `npm start`
4. Open http://localhost:8080/admin/ and edit. Changes write to
   `src/_data/site.json` on your machine. (Re-comment `local_backend` before deploying.)

## Deploy + real login (the Netlify dashboard steps)

These are account actions you do in the Netlify UI:

1. Push this folder to a **new GitHub repo** (sandbox, not the live site repo).
2. In Netlify, **Add new site -> Import from GitHub**, pick the repo.
   Build settings are already in `netlify.toml` (build `npm run build`, publish `_site`).
3. In the site's **Netlify Identity** tab: click **Enable Identity**.
4. Under Identity -> **Registration**, set it to **Invite only**.
5. Scroll to **Services -> Git Gateway** and click **Enable Git Gateway**.
6. Identity -> **Invite users**, invite the client's email (or your own to test).
   Accept the emailed invite and set a password.
7. Go to `your-site.netlify.app/admin/`, log in, and edit. Saving commits to
   GitHub, and Netlify rebuilds in about a minute.

## Notes

- Decap needs the site on Git (that's why step 1 matters). Drag-and-drop deploys
  can't use Git Gateway.
- Prices are stored as plain numbers (no `$`); the template adds the `$`.
- When you're happy with the pattern, build it into new sites from the start and
  sell "edit your own content" as a Premium feature.
