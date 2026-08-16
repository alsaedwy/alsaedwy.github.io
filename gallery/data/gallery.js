/* ============================================================
   THE SECTIONS
   ============================================================

   Two data files, and they do not overlap:

     gallery/data/photos.js   the photos — every file, and anything you
                              want to say about one (a person's name, a
                              title, a year). Written by the scan, and it
                              keeps whatever you type there.

     gallery/data/gallery.js  this file — the sections themselves: their
                              order, titles, and which photo fronts them.

   So: names of people go in photos.js, next to the photo.
   Section settings go here.

   To add photos:
     1. copy files into gallery/images/<section>/
        (Irish Faces: gallery/images/irish-faces/<county>/)
     2. python3 gallery/scripts/scan.py

   To add a whole new section:
     1. mkdir gallery/images/<name>      (lowercase, hyphens for spaces)
     2. python3 gallery/scripts/scan.py  (it finds any folder by itself)
     3. add a block below with id matching the folder name

   ---- what you can set here ------------------------------------

   id       must match the folder under gallery/images/
   title    what the card and the masthead say
   cover    the section's thumbnail on the front page — a filename from
            that section's folder. Empty means "use the first photo".
   shape    the shape of that thumbnail (see below)
   blurb    one line under the section title. Left off everywhere except
            Irish Faces.
   photos   optional. Filenames to lift to the front, in this order:
                photos: ['opener.jpg', 'closer.jpg'],
            Anything not named stays behind them in filename order, so a
            short list never hides the rest. Without it, everything shows
            by filename.

   Sections render in the order they appear below.

   ---- thumbnail shape ------------------------------------------

   'shape' at the top level sets every card; on a section it overrides
   just that one. Cards of different shapes still pack together without
   leaving gaps.

       auto        use the cover photo's own shape — nothing is cropped
       landscape   3/2          portrait   4/5
       wide        16/9         tall       2/3
       square      1/1
       '5/4'       any ratio you like

   Default is auto.
   ============================================================ */

window.GALLERY = {

  /* Shape for every section card; override per section below. */
  shape: 'auto',

  sections: [

    {
      /* All 32 counties are always on the map. A county with no folder,
         or an empty one, stays there — just unlit. The fullest counties
         lead; ties fall back to alphabetical.

         Names of the people go in photos.js, beside each portrait. */
      id: 'irish-faces',
      title: 'Irish Faces',
      blurb: '10 faces for each of the 32 counties',
      kind: 'counties',
      cover: '',

      /* Each county tile shows its tally against this, e.g. 03/10.
         Set it to 0 for a plain count. */
      target: 10,

      /* Main image for a county tile. Without one, its first photo is
         used.  covers: { kerry: 'fiddler.jpg' } */
      covers: {},

      /* Relabel a county. The folder name never changes, only the label —
         so 'derry' stays the folder either way.
             rename: { derry: 'Londonderry' } */
      rename: {},

      /* Lift photos to the front within a county, as with photos above:
             counties: { kerry: ['charlie.jpg'] } */
    },

    {
      id: 'landscape',
      title: 'Landscape',
      cover: 'dunquin_pier_1_BW_DSC3618-4.jpg',
    },

    {
      id: 'street',
      title: 'Street',
      cover: 'IMG_0387.JPG',
    },

    {
      id: 'portraits',
      title: 'Portraits',
      cover: 'ciara_2.jpg',
    },

    {
      id: 'abyusif',
      title: 'Abyusif',
      cover: 'abyusif-14.jpg',
    },

    {
      id: 'allie-sherlock',
      title: 'Allie Sherlock',
      cover: 'BW_DSC1523-Enhanced-NR-3.jpg',
    },

  ],
};
