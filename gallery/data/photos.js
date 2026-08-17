/* The photo list. Written by gallery/scripts/scan.py.
   Re-run it after adding photos:  python3 gallery/scripts/scan.py

   You may add details to any entry by hand — they are kept when
   the scan runs again. "f" and "ar" are managed for you.

     { "f": "portrait.jpg", "ar": "1200/1500", "name": "Charlie O'Brien" }

     name   person in the picture, printed under it on county pages
     title  shown on hover and in the viewer
     where  location line          year   year line
     span   2 for a double-wide tile
     thumb  smaller file for the grid; the viewer uses the original

   Keep it valid JSON: "double quotes", commas between entries. */
window.GALLERY_FILES = {
   "abyusif": [
      {
         "ar": "1080/828",
         "f": "abyusif-1.jpg"
      },
      {
         "ar": "1080/720",
         "f": "abyusif-11.jpg"
      },
      {
         "ar": "1080/720",
         "f": "abyusif-12.jpg"
      },
      {
         "ar": "1080/720",
         "f": "abyusif-13.jpg"
      },
      {
         "ar": "688/1080",
         "f": "abyusif-14.jpg"
      },
      {
         "ar": "768/1080",
         "f": "abyusif-2-2.jpg"
      },
      {
         "ar": "1080/720",
         "f": "abyusif-2.jpg"
      },
      {
         "ar": "589/1080",
         "f": "abyusif-3-2_bw_vertical.jpg"
      },
      {
         "ar": "1080/720",
         "f": "abyusif-5.jpg"
      }
   ],
   "allie-sherlock": [
      {
         "ar": "1080/1350",
         "f": "BW_DSC0697-Enhanced-NR-2.jpg"
      },
      {
         "ar": "1080/1350",
         "f": "BW_DSC1125-Enhanced-NR.jpg"
      },
      {
         "ar": "1080/1350",
         "f": "BW_DSC1129-Enhanced-NR.jpg"
      },
      {
         "ar": "1080/1350",
         "f": "BW_DSC1232-Enhanced-NR.jpg"
      },
      {
         "ar": "1080/1350",
         "f": "BW_DSC1365-Enhanced-NR.jpg"
      },
      {
         "ar": "1080/1350",
         "f": "BW_DSC1439-Enhanced-NR.jpg"
      },
      {
         "ar": "1080/1350",
         "f": "BW_DSC1523-Enhanced-NR-3.jpg"
      },
      {
         "ar": "1080/1350",
         "f": "BW_DSC1523-Enhanced-NR.jpg"
      },
      {
         "ar": "1080/1350",
         "f": "BW_DSC1600-Enhanced-NR-2.jpg"
      },
      {
         "ar": "1080/565",
         "f": "_DSC1765-Enhanced-NR.jpg"
      },
      {
         "ar": "1080/565",
         "f": "bw_DSC0704.jpg"
      },
      {
         "ar": "1080/565",
         "f": "bw_DSC0741.jpg"
      },
      {
         "ar": "1080/565",
         "f": "bw_DSC1113.jpg"
      },
      {
         "ar": "1080/565",
         "f": "bw_DSC1167-Enhanced-NR-Edit-2.jpg"
      },
      {
         "ar": "1080/565",
         "f": "bw_DSC1167-Enhanced-NR-Edit.jpg"
      },
      {
         "ar": "1080/565",
         "f": "bw_DSC1173-Enhanced-NR-2.jpg"
      },
      {
         "ar": "1080/565",
         "f": "bw_DSC1232-2.jpg"
      },
      {
         "ar": "1080/565",
         "f": "bw_DSC1239-Enhanced-NR-Edit-2.jpg"
      },
      {
         "ar": "1080/565",
         "f": "bw_DSC1524-2.jpg"
      },
      {
         "ar": "1080/565",
         "f": "bw_DSC1609.jpg"
      },
      {
         "ar": "1080/565",
         "f": "bw_DSC1671.jpg"
      },
      {
         "ar": "1080/566",
         "f": "bw_equence_1-2.jpg"
      },
      {
         "ar": "1080/566",
         "f": "bw_sequence_2-2.jpg"
      }
   ],
   "irish-faces": {
      "cork": [
         {
            "ar": "5124/5124",
            "f": "BNW_DSC5342_cookie.JPG",
            "name": "Cookie"
         }
      ],
      "kerry": [
         {
            "ar": "4587/6881",
            "f": "_DSC3598-2_NIK(1).jpg",
            "name": "Charlie O'Brien"
         },
         {
            "ar": "1080/1350",
            "f": "daniel_irish_faces_kerry-2.jpg",
            "name": "Daniel"
         }
      ],
      "kilkenny": [
         {
            "ar": "1080/1350",
            "f": "bw_DSC1789-Enhanced-NR.jpg",
            "name": "Michael"
         }
      ],
      "limerick": [
         {
            "ar": "5065/7598",
            "f": "alec_noonan.jpg",
            "name": "Alec Noonan"
         }
      ]
   },
   "landscape": [
      {
         "ar": "2048/1357",
         "f": "1262676_622831814428110_261257406_o.jpg"
      },
      {
         "ar": "2048/1357",
         "f": "256340_435474193163874_1738249303_o.jpg"
      },
      {
         "ar": "2048/1340",
         "f": "329735_452360948141865_1716500715_o.jpg"
      },
      {
         "ar": "2048/1283",
         "f": "55320_469596796418280_583775461_o.jpg"
      },
      {
         "ar": "7894/5265",
         "f": "dunquin_pier_1_BW_DSC3618-4.jpg"
      },
      {
         "ar": "3486/3486",
         "f": "dunquin_pier_2_BW_DSC3618-3-2.jpg"
      },
      {
         "ar": "3113/3113",
         "f": "dunquin_pier_3_BW_DSC3618-3-3.jpg"
      },
      {
         "ar": "1327/1327",
         "f": "dunquin_pier_3_BW_DSC3618-3.jpg"
      },
      {
         "ar": "1080/1080",
         "f": "glenechaquin_2.jpg"
      },
      {
         "ar": "1080/1350",
         "f": "hags_tooth-1.jpg"
      },
      {
         "ar": "7951/4163",
         "f": "skogafoss.jpg"
      },
      {
         "ar": "1080/1080",
         "f": "two_trees_bw_1.jpg"
      },
      {
         "ar": "1080/1080",
         "f": "two_trees_bw_2.jpg"
      },
      {
         "ar": "1080/1080",
         "f": "two_trees_bw_3.jpg"
      }
   ],
   "portraits": [
      {
         "ar": "2048/1357",
         "f": "469549_435474269830533_1042325873_o.jpg"
      },
      {
         "ar": "1631/1080",
         "f": "8015749619_5b8b64406b_o.jpg"
      },
      {
         "ar": "1080/1080",
         "f": "Forgotten_4.jpg"
      },
      {
         "ar": "1080/1745",
         "f": "charlie_3_custom.jpg"
      },
      {
         "ar": "1080/861",
         "f": "ciara-4.jpg"
      },
      {
         "ar": "1080/854",
         "f": "ciara_2.jpg"
      },
      {
         "ar": "1080/1080",
         "f": "michelle_davids_2.jpg"
      },
      {
         "ar": "1080/1080",
         "f": "michelle_davids_3.jpg"
      },
      {
         "ar": "1080/1080",
         "f": "mussab.jpg"
      },
      {
         "ar": "1080/720",
         "f": "nelly_a.jpg"
      }
   ],
   "street": [
      {
         "ar": "2048/1332",
         "f": "191018_452360678141892_1770740577_o.jpg"
      },
      {
         "ar": "2048/1057",
         "f": "194784_462486420462651_304214516_o.jpg"
      },
      {
         "ar": "2048/1357",
         "f": "266668_465107146867245_543376934_o.jpg"
      },
      {
         "ar": "1850/2048",
         "f": "277884_435477169830243_1859276482_o.jpg"
      },
      {
         "ar": "2048/1230",
         "f": "277960_435473573163936_1064592122_o.jpg"
      },
      {
         "ar": "1160/768",
         "f": "279997_451588931552400_1621020754_o.jpg"
      },
      {
         "ar": "2048/1357",
         "f": "287219_452360048141955_1513948633_o.jpg"
      },
      {
         "ar": "2048/1357",
         "f": "287942_452360794808547_1159305927_o.jpg"
      },
      {
         "ar": "2048/1357",
         "f": "330815_435392396505387_547304869_o.jpg"
      },
      {
         "ar": "2048/1357",
         "f": "334250_435473749830585_465451727_o.jpg"
      },
      {
         "ar": "2048/1235",
         "f": "335320_452360574808569_1075779431_o.jpg"
      },
      {
         "ar": "2048/1275",
         "f": "335390_452360524808574_1964578499_o.jpg"
      },
      {
         "ar": "2048/1357",
         "f": "413181_435473653163928_886596257_o.jpg"
      },
      {
         "ar": "2048/1695",
         "f": "469310_435473453163948_1850414527_o.jpg"
      },
      {
         "ar": "2048/2048",
         "f": "469381_435476053163688_2049373641_o.jpg"
      },
      {
         "ar": "2048/1314",
         "f": "471272_435473076497319_827999450_o.jpg"
      },
      {
         "ar": "2048/1262",
         "f": "614367_457227540988539_172260840_o.jpg"
      },
      {
         "ar": "2048/1357",
         "f": "622687_462486380462655_1974140189_o.jpg"
      },
      {
         "ar": "2048/1357",
         "f": "665323_468582009853092_1378573288_o.jpg"
      },
      {
         "ar": "768/1069",
         "f": "8061885154_07dbaed795_o.jpg"
      },
      {
         "ar": "2268/4032",
         "f": "EXC_BNW_EXPORT_NON_IMG_6232-2.jpg"
      },
      {
         "ar": "1051/768",
         "f": "IMG_0085.jpeg"
      },
      {
         "ar": "1080/1080",
         "f": "IMG_0292.JPG"
      },
      {
         "ar": "1619/1080",
         "f": "IMG_0293.JPG"
      },
      {
         "ar": "1080/1080",
         "f": "IMG_0315.JPG"
      },
      {
         "ar": "1619/1080",
         "f": "IMG_0316.JPG"
      },
      {
         "ar": "1619/1080",
         "f": "IMG_0319.JPG"
      },
      {
         "ar": "1467/1080",
         "f": "IMG_0338.JPG"
      },
      {
         "ar": "1080/1080",
         "f": "IMG_0340.JPG"
      },
      {
         "ar": "1080/1080",
         "f": "IMG_0352.JPG"
      },
      {
         "ar": "1080/1080",
         "f": "IMG_0355.JPG"
      },
      {
         "ar": "1593/1080",
         "f": "IMG_0365.JPG"
      },
      {
         "ar": "1080/1080",
         "f": "IMG_0369.JPG"
      },
      {
         "ar": "1080/729",
         "f": "IMG_0371.JPG"
      },
      {
         "ar": "1080/1080",
         "f": "IMG_0381.JPG"
      },
      {
         "ar": "1080/1350",
         "f": "IMG_0387.JPG"
      },
      {
         "ar": "1080/720",
         "f": "IMG_0390.JPG"
      },
      {
         "ar": "1080/720",
         "f": "IMG_0405.JPG"
      },
      {
         "ar": "1080/720",
         "f": "IMG_0425.JPG"
      },
      {
         "ar": "7626/5087",
         "f": "charlie_2_vingette_full.jpg"
      },
      {
         "ar": "7780/5189",
         "f": "charlie_4_max_full.jpg"
      },
      {
         "ar": "1080/748",
         "f": "michelle_davids.jpg"
      },
      {
         "ar": "1620/1080",
         "f": "time_9.jpg"
      }
   ]
};
