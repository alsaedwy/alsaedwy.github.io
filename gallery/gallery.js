/* ============================================================
   Gallery — alaa.sh
   Hash-routed, no build step, no dependencies.

   Routes
     #/                        the five sections
     #/landscape               one section's photos
     #/landscape/3             photo 3 of that section, open
     #/irish-faces             all 32 counties
     #/irish-faces/kerry       one county's photos
     #/irish-faces/kerry/2     photo 2 of that county, open
   ============================================================ */

(function () {
  'use strict';

  var IMAGES = 'gallery/images/';
  var MAP = window.IRELAND_MAP;
  var DATA = window.GALLERY;

  var view = document.getElementById('view');
  var title = document.getElementById('title');
  var back = document.getElementById('back-link');
  var lightbox = document.getElementById('lightbox');
  var lbStage = document.getElementById('lb-stage');
  var lbTitle = document.getElementById('lb-title');
  var lbWhere = document.getElementById('lb-where');
  var lbCounter = document.getElementById('lb-counter');
  var lbPrev = document.getElementById('lb-prev');
  var lbNext = document.getElementById('lb-next');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- data ---------- */

  function resolve(src, dir) {
    if (!src) return '';
    if (/^(https?:)?\/\//.test(src) || src.charAt(0) === '/') return src;
    return IMAGES + dir + '/' + src;
  }

  function normList(list, dir) {
    return (list || []).map(function (entry) {
      var photo = typeof entry === 'string' ? { src: entry } : Object.assign({}, entry);
      photo.src = resolve(photo.src, dir);
      /* Optional smaller file for grid tiles; the viewer always uses src. */
      photo.thumb = photo.thumb ? resolve(photo.thumb, dir) : photo.src;
      return photo;
    });
  }

  /* A scanned record is the photo: filename plus whatever was written
     beside it in photos.js (name, title, where, year, span, thumb). */
  function fromRecord(record) {
    var photo = {};
    for (var key in record) {
      if (key !== 'f') photo[key] = record[key];
    }
    photo.src = record.f;
    return photo;
  }

  /* What scan.py found on disk, if it has been run. */
  function scanned(sectionId, countyId) {
    var all = window.GALLERY_FILES || {};
    var found = all[sectionId];
    if (!found) return [];
    if (countyId) return (found[countyId] || []);
    return Array.isArray(found) ? found : [];
  }

  /* Every file in the folder shows, alphabetically. Naming files in the
     manifest lifts those to the front, in the order given; anything not
     named keeps its place behind them. Listing a few therefore never
     hides the rest — details still come from photos.js either way. */
  function listFor(raw, dir, sectionId, countyId) {
    var found = scanned(sectionId, countyId);
    var explicit = countyId ? (raw.counties && raw.counties[countyId]) : raw.photos;
    if (!explicit || !explicit.length) return normList(found.map(fromRecord), dir);

    var known = {};
    found.forEach(function (record) { known[record.f] = record; });

    var pinned = explicit.map(function (entry) {
      var src = typeof entry === 'string' ? entry : entry.src;
      var base = known[src] ? fromRecord(known[src]) : {};
      return Object.assign(base, typeof entry === 'string' ? {} : entry, { src: src });
    });

    var named = {};
    pinned.forEach(function (photo) { named[photo.src] = true; });
    var rest = found.filter(function (record) { return !named[record.f]; }).map(fromRecord);

    return normList(pinned.concat(rest), dir);
  }

  var sections = DATA.sections.map(function (raw, i) {
    var dir = raw.dir || raw.id;
    var section = {
      id: raw.id,
      title: raw.title,
      blurb: raw.blurb || '',
      kind: raw.kind || 'photos',
      dir: dir,
      index: i + 1,
    };

    if (section.kind === 'counties') {
      section.target = raw.target || 0;      /* photos wanted per county */
      var covers = raw.covers || {};
      var labels = raw.rename || {};         /* relabel a county */
      section.groups = MAP.counties.map(function (county) {
        var photos = listFor(raw, dir + '/' + county.id, section.id, county.id);
        return Object.assign({}, county, {
          name: labels[county.id] || county.name,
          photos: photos,
          cover: covers[county.id]
            ? resolve(covers[county.id], dir + '/' + county.id)
            : (photos[0] ? photos[0].thumb : ''),
        });
      });
      section.photos = section.groups.reduce(function (all, g) { return all.concat(g.photos); }, []);
    } else {
      section.photos = listFor(raw, dir, section.id, null);
    }

    section.cover = raw.cover
      ? resolve(raw.cover, dir)
      : (section.photos[0] ? section.photos[0].thumb : '');

    /* The scan already knows the cover's shape, so an auto-shaped card is
       correct on the first paint — no waiting for the image to load. */
    section.shape = raw.shape || '';
    var coverPhoto = section.photos.filter(function (p) {
      return p.src === section.cover || p.thumb === section.cover;
    })[0];
    section.coverAr = coverPhoto && coverPhoto.ar ? ratio(coverPhoto.ar) : 0;

    return section;
  });

  var byId = {};
  sections.forEach(function (s) { byId[s.id] = s; });

  /* ---------- helpers ---------- */

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  function pad(n, width) {
    var s = String(n);
    while (s.length < (width || 2)) s = '0' + s;
    return s;
  }

  /* Named thumbnail shapes for the section cards. 'auto' follows whatever
     shape the cover photo actually is. */
  var SHAPES = {
    landscape: '3/2',
    portrait: '4/5',
    square: '1/1',
    wide: '16/9',
    tall: '2/3',
  };

  function isAuto(section) {
    return (section.shape || DATA.shape || 'auto') === 'auto';
  }

  function shapeFor(section) {
    var want = section.shape || DATA.shape || 'auto';
    if (want === 'auto') return section.coverAr || SHAPES.landscape;
    return SHAPES[want] || want;   /* a raw ratio like '5/4' also works */
  }

  /* '3/2', '1.5' or nothing -> width ÷ height, defaulting to a portrait. */
  function ratio(value) {
    if (!value) return 0.8;
    var parts = String(value).split('/');
    var w = parseFloat(parts[0]);
    var h = parts.length > 1 ? parseFloat(parts[1]) : 1;
    return w > 0 && h > 0 ? w / h : 0.8;
  }

  /* The masthead is also the way back up: GALLERY | IRISH FACES | KERRY,
     with every step but the last a link. `trail` is the path above the
     current page, nearest last. */
  function setHead(trail, current, parts) {
    var steps = trail.map(function (step, i) {
      return '<a class="' + (i === 0 ? 'home' : 'tag') + '" href="' + step.hash + '">' +
        esc(step.label) + '</a>';
    });
    if (!trail.length) steps.push('<span class="home">Gallery</span>');
    if (current) steps.push('<span class="tag now">' + esc(current) + '</span>');

    /* No separator elements — CSS gives each step after the first a
       leading bar, so a wrapped line starts with it instead of the
       previous line ending on a dangling one. */
    title.innerHTML = steps.join('');
    document.title = ['Alaa Saeed', 'Gallery'].concat(parts || []).join(' | ');
    setBack(trail);
  }

  /* Back goes one step up, not always home: from a county to Irish Faces,
     from a section to the gallery, and only off the gallery at the top. */
  function setBack(trail) {
    var up = trail[trail.length - 1];
    if (up) {
      back.href = up.hash;
      back.removeAttribute('data-leave');
      back.querySelector('.where').textContent = up.label.toLowerCase();
    } else {
      back.href = 'index.html';
      back.setAttribute('data-leave', '');
      back.querySelector('.where').textContent = 'alaa.sh';
    }
  }

  var HOME = { label: 'Gallery', hash: '#/' };

  function countLabel(n) {
    if (!n) return 'empty';
    return pad(n) + ' ' + (n === 1 ? 'photo' : 'photos');
  }

  /* Irish Faces counts towards a whole: 10 per county over 32 counties,
     so the card reads 003/320. Everything else just counts. */
  function tally(section) {
    if (section.kind !== 'counties' || !section.target) return countLabel(section.photos.length);
    var goal = section.target * section.groups.length;
    return '<em>' + pad(section.photos.length, 3) + '</em><i>/' + pad(goal, 3) + '</i>';
  }

  function photoImg(photo, eager) {
    return '<img src="' + esc(photo.thumb || photo.src) + '" alt="' + esc(photo.title || '') + '"' +
      ' loading="' + (eager ? 'eager' : 'lazy') + '" decoding="async" draggable="false">';
  }

  /* ---------- map plumbing ---------- */

  /* Every county path is defined once and pulled in with <use>, so a page
     of 26 maps stays cheap. */
  function buildMapDefs() {
    var defs = ['<path id="ie-all" d="' + MAP.counties.map(function (c) { return c.d; }).join('') + '"/>'];
    MAP.counties.forEach(function (c) {
      defs.push('<path id="ie-' + c.id + '" d="' + c.d + '" pathLength="1"/>');
    });
    document.getElementById('map-defs').innerHTML = '<defs>' + defs.join('') + '</defs>';
  }

  function mapSvg(countyId, cls) {
    return '<svg class="map ' + (cls || '') + '" viewBox="' + MAP.viewBox + '" aria-hidden="true">' +
      '<use href="#ie-all" class="all"/>' +
      '<use href="#ie-' + countyId + '" class="hi"/>' +
      '</svg>';
  }

  /* ---------- views ---------- */

  function viewIndex() {
    setHead([], '', []);

    var cards = sections.map(function (s) {
      var frame = s.cover
        ? '<img src="' + esc(s.cover) + '" alt="" loading="lazy" decoding="async" draggable="false">'
        : '<div class="holder" data-label="no cover yet"></div>';

      return '<a class="card reveal shielded" href="#/' + s.id + '">' +
        '<div class="frame"' + (isAuto(s) ? ' data-auto' : '') +
          ' style="aspect-ratio:' + esc(shapeFor(s)) + '">' + frame + '</div>' +
        '<div class="meta">' +
          '<span class="name">' + esc(s.title) + '</span>' +
          '<span class="count">' + tally(s) + '</span>' +
        '</div>' +
        (s.blurb ? '<p class="blurb">' + esc(s.blurb) + '</p>' : '') +
        '</a>';
    }).join('');

    return '<div class="sections">' + cards + '</div>';
  }

  /* withNames prints the sitter's name under each frame, for the portraits. */
  function photoGrid(photos, routeBase, emptyPath, withNames) {
    if (!photos.length) {
      return '<div class="empty-note">' +
        'Nothing here yet.<br><br>Drop files into <code>' + esc(emptyPath) + '</code> ' +
        'then run <code>python3 gallery/scripts/scan.py</code>.' +
        '</div>';
    }

    return '<div class="grid">' + photos.map(function (p, i) {
      var who = withNames
        ? '<span class="who">' + (esc(p.name || p.title || '') || '&nbsp;') + '</span>'
        : '';

      /* Named grids print the name below; elsewhere the caption slides up
         over the photo on hover. */
      var caption = !withNames && (p.title || p.where || p.year)
        ? '<figcaption>' + esc(p.title || '') +
            (p.where || p.year ? '<span>' + esc([p.where, p.year].filter(Boolean).join(' · ')) + '</span>' : '') +
          '</figcaption>'
        : '';

      /* The shot box carries the photo's true shape, so nothing is cropped
         and the tile has a height before the image has loaded. */
      return '<a class="tile reveal shielded" href="#/' + routeBase + '/' + i + '"' +
        (p.span ? ' data-span="' + esc(p.span) + '"' : '') +
        ' data-i="' + i + '">' +
        '<span class="shot" style="aspect-ratio:' + ratio(p.ar) + '">' +
          photoImg(p, i < 6) + caption +
        '</span>' + who +
        '</a>';
    }).join('') + '</div>';
  }

  function viewSection(section) {
    setHead([HOME], section.title, [section.title]);

    return (section.blurb ? '<p class="lede">' + esc(section.blurb) + '</p>' : '') +
      photoGrid(section.photos, section.id, IMAGES + section.dir + '/');
  }

  var PROVINCES = ['All', 'Leinster', 'Munster', 'Connacht', 'Ulster'];

  function viewCounties(section) {
    setHead([HOME], section.title, [section.title]);

    var filters = '<div class="filters" id="prov-filter">' + PROVINCES.map(function (p, i) {
      return '<button type="button" data-prov="' + p + '" aria-pressed="' + (i === 0) + '">' + p + '</button>';
    }).join('') + '</div>';

    /* Fullest counties lead; ties fall back to alphabetical. */
    var ordered = section.groups.slice().sort(function (a, b) {
      return b.photos.length - a.photos.length || a.name.localeCompare(b.name);
    });

    var tiles = ordered.map(function (g) {
      var n = g.photos.length;
      var bed = g.cover
        ? '<div class="bed"><img src="' + esc(g.cover) + '" alt="" loading="lazy" decoding="async" draggable="false"></div>'
        : '';
      var tally = section.target
        ? pad(n) + '<i>/' + pad(section.target) + '</i>'
        : (n ? pad(n) : '—');

      return '<a class="county reveal shielded' + (n ? '' : ' empty') + '"' +
        ' href="#/' + section.id + '/' + g.id + '" data-prov="' + esc(g.province) + '">' +
        bed + mapSvg(g.id) +
        '<div class="label">' +
          '<div class="row">' +
            '<span class="en">' + esc(g.name) + '</span>' +
            '<span class="n">' + tally + '</span>' +
          '</div>' +
          '<div class="ga">' + esc(g.ga) + '</div>' +
        '</div>' +
        '</a>';
    }).join('');

    return (section.blurb ? '<p class="lede">' + esc(section.blurb) + '</p>' : '') +
      filters + '<div class="counties">' + tiles + '</div>';
  }

  function viewCounty(section, group) {
    setHead([HOME, { label: section.title, hash: '#/' + section.id }],
      group.name, [section.title, group.name]);

    return '<div class="county-head">' + mapSvg(group.id) +
      '<div>' +
        '<div class="prov">' + esc(group.province) + '</div>' +
        '<h2>' + esc(group.name) + '</h2>' +
        '<div class="ga">' + esc(group.ga) + '</div>' +
      '</div>' +
      '</div>' +
      photoGrid(group.photos, section.id + '/' + group.id,
        IMAGES + section.dir + '/' + group.id + '/', true);
  }

  function viewMissing() {
    setHead([HOME], '404', ['Not found']);
    return '<div class="empty-note">No such section. <a href="#/" style="color:var(--accent)">Go back</a>.</div>';
  }

  /* ---------- routing ---------- */

  function parseRoute() {
    var parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    var photo = null;
    if (parts.length && /^\d+$/.test(parts[parts.length - 1])) photo = parseInt(parts.pop(), 10);
    return { parts: parts, photo: photo };
  }

  /* What the current page is showing, so the lightbox knows its neighbours. */
  var current = { key: null, photos: [], base: '' };

  function resolveView(parts) {
    var section = parts.length ? byId[parts[0]] : null;

    if (!parts.length) return { html: viewIndex, photos: [], base: '' };
    if (!section) return { html: viewMissing, photos: [], base: '' };

    if (section.kind === 'counties') {
      if (parts.length === 1) return { html: function () { return viewCounties(section); }, photos: [], base: '' };
      var group = section.groups.filter(function (g) { return g.id === parts[1]; })[0];
      if (!group) return { html: viewMissing, photos: [], base: '' };
      return {
        html: function () { return viewCounty(section, group); },
        photos: group.photos,
        base: section.id + '/' + group.id,
      };
    }

    if (parts.length > 1) return { html: viewMissing, photos: [], base: '' };
    return { html: function () { return viewSection(section); }, photos: section.photos, base: section.id };
  }

  function paint(parts) {
    var resolved = resolveView(parts);
    view.innerHTML = resolved.html();
    current.photos = resolved.photos;
    current.base = resolved.base;
    afterPaint();
  }

  function canTransition() {
    return typeof document.startViewTransition === 'function' &&
      !reduceMotion &&
      document.visibilityState === 'visible';
  }

  var pendingMorph = null;   // element the lightbox should grow out of
  var running = 0;           // transitions in flight
  var firstRender = true;
  var lastPhoto = null;
  var canGoBack = false;     // true when opening the viewer added a history entry

  function render() {
    var route = parseRoute();
    var key = route.parts.join('/');

    /* Opening the viewer pushes an entry, so Esc can simply go back and the
       browser's own back button closes it. Stepping between photos replaces
       instead of pushing, so back never walks the whole reel. */
    if (lastPhoto === null && route.photo !== null) canGoBack = !firstRender;
    if (route.photo === null) canGoBack = false;
    lastPhoto = route.photo;
    firstRender = false;

    if (key !== current.key) {
      var run = function () {
        paint(route.parts);
        current.key = key;
        return syncLightbox(route.photo);
      };
      if (canTransition()) startMorph(run);
      else run();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }

    /* Same view, so only the viewer changed. Moving from one photo to the
       next leaves the whole page behind it untouched — animating that too
       is what made stepping flicker. */
    var stepping = lbIndex !== null && route.photo !== null;
    if (canTransition()) startMorph(function () { return syncLightbox(route.photo); }, stepping ? 'step' : 'view');
    else syncLightbox(route.photo);
  }

  /* Resolves once the photo can be painted, but never blocks the animation
     for long — a slow decode should not hold the click hostage. */
  function whenDecoded(img) {
    if (!img || typeof img.decode !== 'function') return Promise.resolve();
    return Promise.race([
      img.decode().catch(function () {}),
      new Promise(function (resolve) { setTimeout(resolve, 200); }),
    ]);
  }

  /* Names the element being enlarged so the browser morphs it into the
     lightbox instead of cross-fading. */
  /* mode: 'step' between photos, 'view' opening or closing the viewer,
     nothing at all for an ordinary page change. */
  function startMorph(mutate, mode) {
    var from = pendingMorph;
    pendingMorph = null;
    var root = document.documentElement;
    if (from) from.style.viewTransitionName = 'photo';

    root.classList.add('morphing');
    if (mode === 'step') root.classList.add('stepping');
    if (mode === 'view') root.classList.add('viewing');
    running += 1;

    var transition = document.startViewTransition(function () {
      if (from) from.style.viewTransitionName = '';
      /* Returning the promise holds the capture of the new state until the
         full-size photo has decoded — otherwise the morph lands on a blank
         frame and the picture pops in afterwards. */
      return mutate();
    });

    /* A transition aborts if another starts on top of it or the tab is
       hidden. That is fine — the DOM still updates — but every promise
       needs a catch or it surfaces as an unhandled rejection. */
    var hush = function () {};
    transition.ready.catch(hush);
    transition.updateCallbackDone.catch(hush);
    transition.finished.catch(hush).then(function () {
      if (from) from.style.viewTransitionName = '';
      /* Hold the arrow keys down and transitions overlap, each aborting
         the last. Only the final one may clear the flags. */
      running -= 1;
      if (running > 0) return;
      root.classList.remove('morphing');
      root.classList.remove('stepping');
      root.classList.remove('viewing');
    });
  }

  /* ---------- lightbox ---------- */

  var lbIndex = null;

  function syncLightbox(index) {
    if (index == null || !current.photos.length) {
      /* The name stays on the photo while the viewer is open, so stepping
         pairs the outgoing photo with the incoming one instead of leaving
         the old one stranded in the page snapshot. Drop it on the way out. */
      if (lbStage.firstElementChild) lbStage.firstElementChild.style.viewTransitionName = '';
      if (lightbox.open) lightbox.close();
      lbIndex = null;
      return Promise.resolve();
    }

    index = Math.max(0, Math.min(index, current.photos.length - 1));
    lbIndex = index;
    var photo = current.photos[index];

    /* With a transition the morph is the entrance; without one the photo
       needs its own fade. Never both. */
    var morphs = canTransition();
    lbStage.innerHTML = '<img src="' + esc(photo.src) + '" alt="' + esc(photo.title || '') +
      '"' + (morphs ? '' : ' class="fade-in"') + ' decoding="async" draggable="false">';
    if (morphs) lbStage.firstElementChild.style.viewTransitionName = 'photo';

    lbTitle.textContent = photo.title || photo.name || '';
    lbWhere.textContent = [photo.where, photo.year].filter(Boolean).join(' · ');
    lbCounter.textContent = pad(index + 1) + ' / ' + pad(current.photos.length);
    lbPrev.hidden = current.photos.length < 2;
    lbNext.hidden = current.photos.length < 2;

    if (!lightbox.open) lightbox.showModal();
    preload(index + 1);
    preload(index - 1);
    return whenDecoded(lbStage.firstElementChild);
  }

  function preload(i) {
    var photo = current.photos[(i + current.photos.length) % current.photos.length];
    if (photo) { var img = new Image(); img.src = photo.src; }
  }

  /* Bare '#hash' URLs drop any query string, so rebuild the whole path. */
  function url(hash) {
    return location.pathname + location.search + hash;
  }

  function step(delta) {
    if (lbIndex == null) return;
    var next = (lbIndex + delta + current.photos.length) % current.photos.length;
    history.replaceState(null, '', url('#/' + current.base + '/' + next));
    render();
  }

  function closeLightbox() {
    if (canGoBack) history.back();
    else location.replace(url('#/' + current.base));
  }

  lbPrev.addEventListener('click', function () { step(-1); });
  lbNext.addEventListener('click', function () { step(1); });
  document.getElementById('lb-close').addEventListener('click', closeLightbox);

  lightbox.addEventListener('cancel', function (e) { e.preventDefault(); closeLightbox(); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target === lbStage) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.open) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });

  /* swipe */
  var swipeX = null;
  lbStage.addEventListener('pointerdown', function (e) { swipeX = e.clientX; });
  lbStage.addEventListener('pointerup', function (e) {
    if (swipeX == null) return;
    var dx = e.clientX - swipeX;
    swipeX = null;
    if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
  });

  /* ---------- after each paint ---------- */

  var seen = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('seen', 'drawn');
          seen.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px' })
    : null;

  /* ---------- masonry ---------- */

  /* Tiles size themselves (align-self: start), so each one only needs to
     claim enough row tracks to hold its measured height — caption and all.
     Measure everything first, then write, to avoid layout thrash. */
  var GRIDS = [['.grid', '.tile'], ['.sections', '.card']];

  function layout() {
    GRIDS.forEach(function (pair) {
      var grid = view.querySelector(pair[0]);
      if (!grid) return;

      var style = getComputedStyle(grid);
      var track = parseFloat(style.gridAutoRows) || 8;
      var gap = parseFloat(style.rowGap) || 0;

      var spans = [];
      grid.querySelectorAll(pair[1]).forEach(function (item) {
        var height = item.getBoundingClientRect().height;
        if (height) spans.push([item, Math.max(1, Math.ceil((height + gap) / (track + gap)))]);
      });
      spans.forEach(function (both) {
        both[0].style.gridRowEnd = 'span ' + both[1];
      });
    });
  }

  /* A photo the scan has not seen carries no shape, so correct it on load.
     Only auto-shaped boxes are adjusted — a card told to be 'portrait'
     stays portrait whatever its cover happens to be. */
  function measureOnLoad(img) {
    var box = img.closest('.shot') || img.closest('.frame[data-auto]');
    if (!box || !img.naturalWidth) return;
    var real = img.naturalWidth / img.naturalHeight;
    if (Math.abs(real - (parseFloat(box.style.aspectRatio) || 0)) < 0.01) return;
    box.style.aspectRatio = real;
    layout();
  }

  var relayout;
  if ('ResizeObserver' in window) {
    relayout = new ResizeObserver(function () { layout(); });
  } else {
    window.addEventListener('resize', layout);
  }

  function afterPaint() {
    layout();
    if (relayout) relayout.disconnect();

    GRIDS.forEach(function (pair) {
      var grid = view.querySelector(pair[0]);
      if (!grid) return;
      if (relayout) relayout.observe(grid);
      grid.querySelectorAll('img').forEach(function (img) {
        if (img.complete) measureOnLoad(img);
        else img.addEventListener('load', function () { measureOnLoad(img); }, { once: true });
      });
    });

    if (seen) {
      view.querySelectorAll('.reveal, .county').forEach(function (el) { seen.observe(el); });
    } else {
      view.querySelectorAll('.reveal, .county').forEach(function (el) { el.classList.add('seen', 'drawn'); });
    }

    var filter = document.getElementById('prov-filter');
    if (filter) filter.addEventListener('click', onFilter);
  }

  function onFilter(e) {
    var button = e.target.closest('button[data-prov]');
    if (!button) return;
    var province = button.dataset.prov;

    document.querySelectorAll('#prov-filter button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b === button));
    });
    view.querySelectorAll('.county').forEach(function (tile) {
      tile.hidden = province !== 'All' && tile.dataset.prov !== province;
    });
  }

  /* Remember which tile was clicked, so the lightbox can grow out of it. */
  view.addEventListener('click', function (e) {
    var tile = e.target.closest('.tile');
    if (tile) pendingMorph = tile.querySelector('img') || tile;
  });

  /* ---------- picture protection ---------- */
  /* Right-click, drag and long-press are all turned off over photos.
     It stops the casual save; it cannot stop a determined one. */

  document.addEventListener('contextmenu', function (e) {
    if (e.target.closest('.shielded, .lb-stage, #lightbox')) e.preventDefault();
  });
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  /* ---------- boot ---------- */

  window.addEventListener('hashchange', render);

  buildMapDefs();
  render();

  window.addEventListener('load', function () { document.body.classList.remove('is-preload'); });
  /* if load already fired (cached navigations) */
  if (document.readyState === 'complete') document.body.classList.remove('is-preload');
})();
