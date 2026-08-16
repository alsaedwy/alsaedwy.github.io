#!/usr/bin/env python3
"""Scan gallery/images/ and write gallery/data/photos.js.

Run it after dropping new photos in:

    python3 gallery/scripts/scan.py

Every image found is listed with its aspect ratio, so tiles never jump
about while loading.

Anything you have typed into photos.js yourself — a name, a title, a
year — is read back in and kept. So the loop is: drop photos in, run the
scan, write the names next to the files, run the scan again whenever you
add more. Nothing you type is lost.

Stdlib only: no pip install, no build step.
"""

import json
import os
import struct
import sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
IMAGES = os.path.join(ROOT, 'images')
OUT = os.path.join(ROOT, 'data', 'photos.js')

COUNTY_SECTION = 'irish-faces'
EXTS = ('.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif')


def jpeg_size(fh):
    fh.seek(2)
    while True:
        marker = fh.read(2)
        if len(marker) < 2 or marker[0] != 0xFF:
            return None
        code = marker[1]
        (length,) = struct.unpack('>H', fh.read(2))
        # SOF0..SOF15, skipping DHT(C4), JPG(C8) and DAC(CC)
        if 0xC0 <= code <= 0xCF and code not in (0xC4, 0xC8, 0xCC):
            fh.read(1)
            height, width = struct.unpack('>HH', fh.read(4))
            return width, height
        fh.seek(length - 2, os.SEEK_CUR)


def png_size(fh):
    fh.seek(16)
    return struct.unpack('>II', fh.read(8))


def webp_size(fh):
    fh.seek(12)
    chunk = fh.read(4)
    if chunk == b'VP8 ':
        fh.seek(26)
        w, h = struct.unpack('<HH', fh.read(4))
        return w & 0x3FFF, h & 0x3FFF
    if chunk == b'VP8L':
        fh.seek(21)
        bits = struct.unpack('<I', fh.read(4))[0]
        return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    if chunk == b'VP8X':
        fh.seek(24)
        data = fh.read(6)
        w = data[0] | data[1] << 8 | data[2] << 16
        h = data[3] | data[4] << 8 | data[5] << 16
        return w + 1, h + 1
    return None


def dimensions(path):
    """Width and height, or None when the format is not one we can read."""
    try:
        with open(path, 'rb') as fh:
            head = fh.read(4)
            if head[:2] == b'\xff\xd8':
                return jpeg_size(fh)
            if head == b'\x89PNG':
                return png_size(fh)
            if head == b'RIFF':
                return webp_size(fh)
    except Exception:
        return None
    return None


def load_written(path):
    """Read back whatever has been typed into photos.js, keyed by path.

    Only 'f' and 'ar' are ours; everything else on a record was written by
    hand and must survive the rescan.
    """
    if not os.path.exists(path):
        return {}

    text = open(path).read()
    start, end = text.find('='), text.rfind(';')
    if start < 0 or end < start:
        return {}

    try:
        data = json.loads(text[start + 1:end])
    except ValueError as err:
        sys.exit(
            'Could not read %s (%s).\n'
            'Stopping rather than overwriting it, so nothing you typed is lost.\n'
            'Fix the syntax — every name needs "double quotes" and a comma\n'
            'between entries — then run this again.' % (path, err)
        )

    kept = {}

    def collect(records, prefix):
        for record in records:
            extra = {k: v for k, v in record.items() if k not in ('f', 'ar')}
            if extra:
                kept[prefix + '/' + record['f']] = extra

    for section, value in data.items():
        if isinstance(value, dict):
            for county, records in value.items():
                collect(records, section + '/' + county)
        else:
            collect(value, section)
    return kept


def entry(folder, name, key, written):
    record = {'f': name}
    size = dimensions(os.path.join(folder, name))
    if size and size[0] and size[1]:
        record['ar'] = '%d/%d' % size
    record.update(written.get(key + '/' + name, {}))
    return record


def scan_folder(folder, key, written):
    if not os.path.isdir(folder):
        return []
    names = sorted(
        f for f in os.listdir(folder)
        if f.lower().endswith(EXTS) and not f.startswith('.')
    )
    return [entry(folder, name, key, written) for name in names]


def main():
    if not os.path.isdir(IMAGES):
        sys.exit('no images folder at ' + IMAGES)

    written = load_written(OUT)

    data = {}
    for section in sorted(os.listdir(IMAGES)):
        folder = os.path.join(IMAGES, section)
        if not os.path.isdir(folder) or section.startswith('.'):
            continue

        if section == COUNTY_SECTION:
            counties = {}
            for county in sorted(os.listdir(folder)):
                sub = os.path.join(folder, county)
                if not os.path.isdir(sub) or county.startswith('.'):
                    continue
                found = scan_folder(sub, section + '/' + county, written)
                if found:
                    counties[county] = found
            data[section] = counties
        else:
            data[section] = scan_folder(folder, section, written)

    body = json.dumps(data, ensure_ascii=False, indent=1, sort_keys=True)
    with open(OUT, 'w') as fh:
        fh.write('/* The photo list. Written by gallery/scripts/scan.py.\n')
        fh.write('   Re-run it after adding photos:  python3 gallery/scripts/scan.py\n')
        fh.write('\n')
        fh.write('   You may add details to any entry by hand — they are kept when\n')
        fh.write('   the scan runs again. "f" and "ar" are managed for you.\n')
        fh.write('\n')
        fh.write('     { "f": "portrait.jpg", "ar": "1200/1500", "name": "Charlie O\'Brien" }\n')
        fh.write('\n')
        fh.write('     name   person in the picture, printed under it on county pages\n')
        fh.write('     title  shown on hover and in the viewer\n')
        fh.write('     where  location line          year   year line\n')
        fh.write('     span   2 for a double-wide tile\n')
        fh.write('     thumb  smaller file for the grid; the viewer uses the original\n')
        fh.write('\n')
        fh.write('   Keep it valid JSON: "double quotes", commas between entries. */\n')
        fh.write('window.GALLERY_FILES = ' + body + ';\n')

    total = 0
    for section, value in sorted(data.items()):
        if isinstance(value, dict):
            n = sum(len(v) for v in value.values())
            print('%-16s %3d  (%d counties)' % (section, n, len(value)))
        else:
            n = len(value)
            print('%-16s %3d' % (section, n))
        total += n
    print('%-16s %3d  ->  %s' % ('total', total, os.path.relpath(OUT, os.getcwd())))
    if written:
        print('kept %d hand-written entr%s' % (len(written), 'y' if len(written) == 1 else 'ies'))


if __name__ == '__main__':
    main()
