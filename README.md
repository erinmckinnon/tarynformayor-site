# TarynforMayor.com

The campaign website. It's a fast static site hosted on Netlify. Content is edited at **tarynformayor.com/admin**, so nobody needs to touch code.

## For editors (start here)

1. Go to **tarynformayor.com/admin** and log in with your email and password. (First time? Use the invite email you got. It sets your password.)
2. Pick what you want to change from the left menu:
   - **📅 Events**: add, change, or hide events. Past events drop off the homepage on their own.
   - **📰 News & Updates**: add a post. Choose a category, add a square image, write the story.
   - **🏠 Homepage**: headline, photos, bio, stats, issues, volunteer checkboxes.
   - **📄 Other Pages**: Coffee & Conversation, Internships, Business Survey, Rays plan, Privacy Policy.
   - **⚙️ Site Settings**: donate link, phone, email, social links, and the **announcement bar** (a gold strip across the top of every page, good for "Early voting starts…").
3. Click **Publish** (top right), then **Publish now**. The live site updates in about a minute.

There is a gold **❓ How do I…?** button in the bottom-left corner of the editor that opens a plain-English help page (tarynformayor.com/admin/help/).

Tips
- To take something down without deleting it, turn on **Hide this event / Hide this post**.
- To add a photo, use the image field and drag in a file. Square images (1080×1080) work best for news. Flyers work fine for events.
- Mistakes are safe. Every change is saved in the site's history and can be rolled back.

## Where form signups go

- **Stay Connected / footer signup** → Mailchimp audience (same list and tags as the old site).
- **Join the Team (volunteer form)** → Netlify Forms (with phone, ZIP, interests, and notes. Get email alerts and export a CSV under *Netlify → Forms*). The person is also added to Mailchimp.
- **Internship** page → the existing Airtable form (embedded).

## For whoever maintains it

- Built with [Eleventy](https://www.11ty.dev/). The editor is [Decap CMS](https://decapcms.org/) with Netlify Identity + Git Gateway.
- Content lives in `src/events`, `src/news`, `src/pages` (Markdown) and `src/_data/*.json` (homepage, issues, settings). Images live in `src/uploads`.
- Local preview: `npm install && npm start`.
- Old WordPress URLs are preserved (news posts stay at `/post-slug/`, events at `/event/slug/`), and leftovers are redirected in `src/_redirects`.
- Editors are managed in Netlify → Project → Identity (invite-only).
