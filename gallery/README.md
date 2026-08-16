# Gallery

Static, no build step, no dependencies. `gallery.html` at the repo root is
the whole page; everything else lives here.

```
gallery.html                page shell
gallery/gallery.css         styles
gallery/gallery.js          routing, grid, viewer
gallery/data/photos.js      the photos, and what you want said about each
gallery/data/gallery.js     the sections: order, titles, covers
gallery/data/ireland-map.js county outlines — generated, do not hand-edit
gallery/scripts/            the two generators
gallery/images/…            the photos themselves
```

**Which file do I edit?** Only two, and they do not overlap:

| I want to…                                   | file |
|----------------------------------------------|------|
| name the person in a photo, add a title/year | `data/photos.js` — beside that photo |
| set a section's thumbnail, blurb, or order   | `data/gallery.js` |

`photos.js` is written by the scan, but the scan **keeps whatever you type
there**. That is the point: the photo and its name live on the same line.

## Adding photos

**1. Copy the files in**

```
gallery/images/landscape/
gallery/images/street/
gallery/images/portraits/
gallery/images/abyusif/
gallery/images/allie-sherlock/
gallery/images/irish-faces/<county>/     e.g. …/irish-faces/kerry/
```

County folders are lowercase and hyphenated: `kerry`, `dublin`, `cork`,
`dun-laoghaire` is not one — it is `dublin`. Create the folder if it does
not exist yet; only the 32 traditional counties are recognised.

**2. Run the scan**

```bash
python3 gallery/scripts/scan.py
```

That rewrites `gallery/data/photos.js` with everything it finds, including
each photo's shape so tiles never jump about while loading. Commit both
the images and that file. Nothing else is required — the photos are live.

## Adding a new section

Two steps, mirroring the two files.

**1. Make its folder** under `gallery/images/`, named exactly as you want
the URL to read — lowercase, hyphens instead of spaces:

```bash
mkdir gallery/images/portraits
python3 gallery/scripts/scan.py
```

The scan picks up any folder it finds; there is no list of sections inside
it to maintain.

**2. Add it to `sections` in `gallery/data/gallery.js`**, with `id`
matching the folder name:

```js
{
  id: 'portraits',
  title: 'Portraits',
  cover: '',
},
```

Where you put it in the array is where it appears on the front page.

Both steps are needed: a folder with no entry here means the photos are
scanned but never shown, and an entry with no folder shows an empty
section.

## Naming the person in a photo

Open `gallery/data/photos.js`, find the photo, and add `"name"` to its
entry:

```json
{
  "f": "_DSC3598-2_NIK(1).jpg",
  "ar": "4587/6881",
  "name": "Charlie O'Brien"
}
```

The name prints under the portrait on that county's page, and captions the
photo in the full-screen viewer. Re-run the scan as often as you like —
anything you have typed is read back in and kept.

The same entry takes any of:

| key     | what it does                                             |
|---------|----------------------------------------------------------|
| `name`  | person in the picture, printed under it on county pages   |
| `title` | shown on hover and in the viewer                          |
| `where` | location line                                             |
| `year`  | year line                                                 |
| `span`  | `2` makes the tile double-wide                            |
| `thumb` | smaller file for the grid; the viewer still loads the original |

`f` and `ar` are managed by the scan — leave those alone.

It must stay valid JSON: `"double quotes"` around everything, a comma
between entries, no trailing comma. If it gets malformed the scan refuses
to run rather than overwrite it, and tells you the line.

## Making a photo the main one

The main image — the thumbnail for a section on the gallery's front page —
is the section's `cover` in `gallery/data/gallery.js`. Give it a filename
from that section's own folder:

```js
{
  id: 'allie-sherlock',
  title: 'Allie Sherlock',
  cover: 'bw_DSC1609.jpg',      // <- the main one
  ...
}
```

Leave `cover` empty and the section's first photo is used instead.

For **Irish Faces** the same idea applies per county, under `covers`, since
each county tile has its own thumbnail behind the map:

```js
covers: {
  kerry: 'fiddler.jpg',
  dublin: 'liberties-01.jpg',
},
```

Both take a plain filename — the folder is already known from the section
or county.

## The shape of a section thumbnail

By default each card takes its cover photo's own shape, so a portrait
cover shows as a portrait card and nothing is cropped. Cards of different
shapes still pack together without leaving gaps.

To make them all the same instead, set `shape` at the top of
`gallery/data/gallery.js`:

```js
window.GALLERY = {
  shape: 'landscape',     // every card 3:2
  sections: [ … ],
};
```

Or set it on one section, which wins over the top-level value:

```js
{
  id: 'abyusif',
  cover: 'abyusif-14.jpg',
  shape: 'portrait',
}
```

| value       | ratio | |
|-------------|-------|--|
| `auto`      | the cover's own shape — the default |
| `landscape` | 3/2   | `portrait` | 4/5 |
| `wide`      | 16/9  | `tall`     | 2/3 |
| `square`    | 1/1   | |

Any ratio of your own also works: `shape: '5/4'`.

Note that anything other than `auto` crops the cover to fit — the cover
photo is never distorted, only trimmed.

## Irish Faces

All 32 counties are always on the map — the 26 and the 6 of the North.
Three things are specific to this section, all in its block in
`gallery/data/gallery.js`:

**The tally.** Each tile shows how many portraits that county has against
the number you are aiming for:

```js
target: 10,        // tiles read 03/10, 07/10, 10/10 …
```

The section's own card on the front page shows the running total against
the whole project — `target` × 32 counties, so `004/320`. Both follow from
this one number; change it to 12 and the card reads `/384`.

Set `target: 0` for plain counts and no running total.

**The order.** Counties sort by how many portraits they hold, fullest
first; ties fall back to alphabetical. Nothing to configure — add photos
and a county climbs. Empty counties sit at the end, dimmed.

**Naming a county.** County Derry appears under that name. To label it
Londonderry instead, or to relabel any county:

```js
rename: { derry: 'Londonderry' },
```

The folder never changes — photos stay in `irish-faces/derry/` either way.

**Names of people** go in `photos.js` beside each portrait, as above. A
portrait with no name simply shows nothing under it.

## The order photos appear in

By default they run in filename order, which is why a scan of the same
folder always comes out the same.

**To lift particular photos to the front**, name them in the section's
`photos` list in `gallery/data/gallery.js`. They lead, in the order given;
everything else follows behind in filename order:

```js
{
  id: 'landscape',
  photos: ['skogafoss.jpg', 'hags_tooth-1.jpg'],
},
```

Listing two of fourteen puts those two first and leaves the other twelve
where they were — a short list never hides anything. List every filename
if you want to place them all exactly.

**Inside a county**, the same thing goes under `counties`, keyed by county:

```js
counties: {
  kerry: ['charlie.jpg'],
  cork: ['opener.jpg', 'second.jpg'],
},
```

Names, titles and years still come from `photos.js` — pinning only moves a
photo, it never means re-typing its details.

**For a large section**, renaming the files is usually less work than
listing them, since filename order is the default:

```bash
cd gallery/images/street && i=1; for f in *.jpg; do mv "$f" "$(printf '%03d' $i)_$f"; i=$((i+1)); done
```

That gives `001_…`, `002_…` and so on; reorder by editing a number. Re-run
the scan afterwards — and note that renaming a file loses any name you had
typed against its old filename in `photos.js`, so do this before writing
names rather than after.

**Sections themselves** render in the order they appear in
`sections: [...]`.

## Thumbnails (optional, worth it past ~50 photos)

Full-size files in the grid are the only thing that will make this page
slow. macOS has `sips` built in:

```bash
cd gallery/images/allie-sherlock && mkdir -p thumbs && for f in *.jpg; do sips -Z 900 "$f" --out "thumbs/$f"; done
```

Then point the entry at it with `"thumb": "thumbs/<name>.jpg"` in
`photos.js`. The viewer still loads the full-resolution original, so
quality is unaffected.

## The county maps

`gallery/data/ireland-map.js` holds one SVG path per county, all 32.
It is generated — regenerate only if the geometry ever needs to change:

```bash
pip install shapely
curl -sL -o ne10.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson
curl -sL -A Mozilla -o ni.geojson "https://admin.opendatani.gov.uk/dataset/d0385f2d-6beb-4aff-87dc-f1bf357d792d/resource/108d8567-3ec7-4403-8912-bcc6233bf361/download/osni_open_data_largescale_boundaries_county_boundaries.geojson"
python gallery/scripts/gen_counties.py
```

Two sources, because no single open dataset carries all 32 traditional
counties cleanly:

- **The 26** come from Natural Earth 10m admin-1 (public domain), which
  spreads them over 34 units — the four Dublin authorities are merged into
  one Dublin, the city/county pairs are unioned, North and South Tipperary
  rejoin, and Laoighis is spelled Laois.
- **The 6** come from OSNI Open Data, Largescale Boundaries, County
  Boundaries (Open Government Licence). Natural Earth only carries the
  North's legacy districts, and those straddle the county lines — Belfast
  sits in both Antrim and Down — so they cannot be merged into counties.

The northern counties are clipped to Natural Earth's outline of the North,
so the two surveys meet along the border without a visible seam.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/gallery.html>.

## Right-click

Right-click, drag and long-press are blocked over every photo, and a
transparent shield sits above each image so the pointer never lands on the
`<img>` itself. That stops casual saving. It cannot stop anyone who opens
devtools or the network tab — nothing served to a browser can. If a photo
must not be copied, the only real defences are a visible watermark and not
publishing the full-resolution file.

## Routes

Hash-routed, so every view is linkable and the back button behaves:

```
gallery.html#/                     the five sections
gallery.html#/landscape            one section
gallery.html#/landscape/3          photo 3, viewer open
gallery.html#/irish-faces          all 32 counties
gallery.html#/irish-faces/kerry    one county
```
