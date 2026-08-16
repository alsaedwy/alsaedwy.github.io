#!/usr/bin/env python
"""Build 32-county Ireland SVG path data.

Two sources, because no single open dataset carries all 32 traditional
counties cleanly:

  ne10.geojson  Natural Earth 10m admin-1 (public domain) — the 26
                counties of the Republic, spread over 34 units.
  ni.geojson    OSNI Open Data, Largescale Boundaries, County Boundaries
                (OGL) — the 6 counties of Northern Ireland. Natural Earth
                only carries NI's legacy districts, which straddle the
                county lines, so they cannot be merged into counties.

Both are projected to Web Mercator, simplified, and written out as one
JS data file sharing a single viewBox.
"""
import json
import math
import unicodedata

from shapely.geometry import shape, mapping
from shapely.ops import unary_union

SRC = "ne10.geojson"
NI_SRC = "ni.geojson"
OUT = "counties.js"

# OSNI spells them in caps; 'LONDONDERRY' is the dataset's name for the
# county shown here as Derry.
NI_NAMES = {
    "ANTRIM": "Antrim",
    "ARMAGH": "Armagh",
    "DOWN": "Down",
    "FERMANAGH": "Fermanagh",
    "LONDONDERRY": "Derry",
    "TYRONE": "Tyrone",
}

# NE unit name -> traditional county
MERGE = {
    "Dublin": "Dublin",
    "Dún Laoghaire–Rathdown": "Dublin",
    "Fingal": "Dublin",
    "South Dublin": "Dublin",
    "North Tipperary": "Tipperary",
    "South Tipperary": "Tipperary",
    "Laoighis": "Laois",
}

# Province per county, for grouping in the UI
PROVINCE = {
    "Carlow": "Leinster", "Dublin": "Leinster", "Kildare": "Leinster",
    "Kilkenny": "Leinster", "Laois": "Leinster", "Longford": "Leinster",
    "Louth": "Leinster", "Meath": "Leinster", "Offaly": "Leinster",
    "Westmeath": "Leinster", "Wexford": "Leinster", "Wicklow": "Leinster",
    "Clare": "Munster", "Cork": "Munster", "Kerry": "Munster",
    "Limerick": "Munster", "Tipperary": "Munster", "Waterford": "Munster",
    "Galway": "Connacht", "Leitrim": "Connacht", "Mayo": "Connacht",
    "Roscommon": "Connacht", "Sligo": "Connacht",
    "Cavan": "Ulster", "Donegal": "Ulster", "Monaghan": "Ulster",
    # the six in Northern Ireland — Ulster's other three are above
    "Antrim": "Ulster", "Armagh": "Ulster", "Derry": "Ulster",
    "Down": "Ulster", "Fermanagh": "Ulster", "Tyrone": "Ulster",
}

IRISH = {
    "Carlow": "Ceatharlach", "Cavan": "An Cabhán", "Clare": "An Clár",
    "Cork": "Corcaigh", "Donegal": "Dún na nGall", "Dublin": "Baile Átha Cliath",
    "Galway": "Gaillimh", "Kerry": "Ciarraí", "Kildare": "Cill Dara",
    "Kilkenny": "Cill Chainnigh", "Laois": "Laois", "Leitrim": "Liatroim",
    "Limerick": "Luimneach", "Longford": "An Longfort", "Louth": "Lú",
    "Mayo": "Maigh Eo", "Meath": "An Mhí", "Monaghan": "Muineachán",
    "Offaly": "Uíbh Fhailí", "Roscommon": "Ros Comáin", "Sligo": "Sligeach",
    "Tipperary": "Tiobraid Árann", "Waterford": "Port Láirge",
    "Westmeath": "An Iarmhí", "Wexford": "Loch Garman", "Wicklow": "Cill Mhantáin",
    "Antrim": "Aontroim", "Armagh": "Ard Mhacha", "Derry": "Doire",
    "Down": "An Dún", "Fermanagh": "Fear Manach", "Tyrone": "Tír Eoghain",
}

WIDTH = 1000.0          # viewBox width
PAD = 12.0              # viewBox padding
SIMPLIFY = 0.0035       # degrees (~350 m) — enough for clean line art
MIN_ISLAND = 0.0008     # drop specks smaller than this (sq. degrees)


def slug(name):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return s.lower().replace(" ", "-")


def mercator(lon, lat):
    x = math.radians(lon)
    y = math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
    return x, y


def rings(geom):
    """Yield exterior/interior rings of a (Multi)Polygon, largest first."""
    polys = geom.geoms if geom.geom_type == "MultiPolygon" else [geom]
    for p in sorted(polys, key=lambda g: -g.area):
        if p.area < MIN_ISLAND:
            continue
        yield list(p.exterior.coords)
        for interior in p.interiors:
            yield list(interior.coords)


def main():
    data = json.load(open(SRC))
    groups = {}
    north_ghost = []
    for feat in data["features"]:
        props = feat["properties"]
        if props.get("geonunit") == "Northern Ireland":
            north_ghost.append(shape(feat["geometry"]))
            continue
        if props.get("admin") != "Ireland":
            continue
        name = props.get("name")
        county = MERGE.get(name, name)
        groups.setdefault(county, []).append(shape(feat["geometry"]))

    assert len(groups) == 26, f"expected 26 in the Republic, got {len(groups)}: {sorted(groups)}"

    merged = {}
    for county, geoms in groups.items():
        # tiny buffer closes hairline slivers between the city/county pairs
        g = unary_union([g.buffer(0) for g in geoms]).buffer(1e-9).buffer(-1e-9)
        merged[county] = g.simplify(SIMPLIFY, preserve_topology=True)

    # The six from OSNI. Natural Earth's outline of the North is the one the
    # Republic's counties were cut against, so clip to it: that keeps the
    # border seamless where two different surveys would otherwise disagree.
    assert north_ghost, "no Northern Ireland features in Natural Earth"
    ghost = unary_union([g.buffer(0) for g in north_ghost]).buffer(1e-9).buffer(-1e-9)

    ni = json.load(open(NI_SRC))
    for feat in ni["features"]:
        raw_name = feat["properties"]["CountyName"].strip().upper()
        county = NI_NAMES[raw_name]
        g = shape(feat["geometry"]).buffer(0).intersection(ghost)
        merged[county] = g.simplify(SIMPLIFY, preserve_topology=True)

    assert len(merged) == 32, f"expected 32 counties, got {len(merged)}: {sorted(merged)}"

    # Global bounds in projected space, so every county shares one viewBox.
    xs, ys = [], []
    for g in merged.values():
        for ring in rings(g):
            for lon, lat in ring:
                x, y = mercator(lon, lat)
                xs.append(x)
                ys.append(y)
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    scale = (WIDTH - 2 * PAD) / (maxx - minx)
    height = (maxy - miny) * scale + 2 * PAD

    def project(lon, lat):
        x, y = mercator(lon, lat)
        return (x - minx) * scale + PAD, (maxy - y) * scale + PAD

    counties = []
    for county in sorted(merged):
        g = merged[county]
        parts = []
        for ring in rings(g):
            pts = [project(lon, lat) for lon, lat in ring]
            d = "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + "Z"
            parts.append(d)
        pt = g.representative_point()
        cx, cy = project(pt.x, pt.y)
        counties.append({
            "id": slug(county),
            "name": county,
            "ga": IRISH[county],
            "province": PROVINCE[county],
            "d": "".join(parts),
            "label": [round(cx, 1), round(cy, 1)],
        })

    payload = {
        "viewBox": f"0 0 {WIDTH:.0f} {height:.0f}",
        "counties": counties,
    }
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    with open(OUT, "w") as fh:
        fh.write("/* Generated. Do not hand-edit — see gallery/scripts/gen_counties.py.\n")
        fh.write("   Republic: Natural Earth 10m admin-1 (public domain).\n")
        fh.write("   Northern Ireland: OSNI Open Data county boundaries (OGL). */\n")
        fh.write("window.IRELAND_MAP = " + body + ";\n")

    by_province = {}
    for c in counties:
        by_province[c["province"]] = by_province.get(c["province"], 0) + 1
    print(f"{len(counties)} counties, viewBox {payload['viewBox']}")
    print("per province:", by_province)
    print("bytes:", len(body))


if __name__ == "__main__":
    main()
