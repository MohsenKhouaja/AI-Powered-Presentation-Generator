export type Theme = {
  name: string;
  id: string;
  colors: string[];
};

export const themes: Theme[] = [
  {
    id: "amber-minimal",
    name: "Amber Minimal",
    colors: [
      "oklch(1.0000 0 0)",
      "oklch(0.7686 0.1647 70.0804)",
      "oklch(0.9869 0.0214 95.2774)",
    ],
  },
  {
    id: "amethyst-haze",
    name: "Amethyst Haze",
    colors: [
      "oklch(0.9777 0.0041 301.4256)",
      "oklch(0.6104 0.0767 299.7335)",
      "oklch(0.7889 0.0802 359.9375)",
    ],
  },
  {
    id: "bold-tech",
    name: "Bold Tech",
    colors: [
      "oklch(1.0000 0 0)",
      "oklch(0.6056 0.2189 292.7172)",
      "oklch(0.9319 0.0316 255.5855)",
    ],
  },
  {
    id: "bubblegum",
    name: "Bubblegum",
    colors: [
      "oklch(0.9399 0.0203 345.6985)",
      "oklch(0.6209 0.1801 348.1385)",
      "oklch(0.9195 0.0801 87.6670)",
    ],
  },
  {
    id: "caffeine",
    name: "Caffeine",
    colors: [
      "oklch(0.9821 0 0)",
      "oklch(0.4341 0.0392 41.9938)",
      "oklch(0.9310 0 0)",
    ],
  },
  {
    id: "catppuccin",
    name: "Catppuccin",
    colors: [
      "oklch(0.9578 0.0058 264.5321)",
      "oklch(0.5547 0.2503 297.0156)",
      "oklch(0.6820 0.1448 235.3822)",
    ],
  },
  {
    id: "claude",
    name: "Claude",
    colors: [
      "oklch(0.9818 0.0054 95.0986)",
      "oklch(0.6171 0.1375 39.0427)",
      "oklch(0.9245 0.0138 92.9892)",
    ],
  },
  {
    id: "claymorphism",
    name: "Claymorphism",
    colors: [
      "oklch(0.9232 0.0026 48.7171)",
      "oklch(0.5854 0.2041 277.1173)",
      "oklch(0.9376 0.0260 321.9388)",
    ],
  },
  {
    id: "clean-slate",
    name: "Clean Slate",
    colors: [
      "oklch(0.9842 0.0034 247.8575)",
      "oklch(0.5854 0.2041 277.1173)",
      "oklch(0.9299 0.0334 272.7879)",
    ],
  },
  {
    id: "cosmic-night",
    name: "Cosmic Night",
    colors: [
      "oklch(0.9730 0.0133 286.1503)",
      "oklch(0.5417 0.1790 288.0332)",
      "oklch(0.9221 0.0373 262.1410)",
    ],
  },
  {
    id: "darkmatter",
    name: "Darkmatter",
    colors: [
      "oklch(1.0000 0 0)",
      "oklch(0.6716 0.1368 48.5130)",
      "oklch(0.9491 0 0)",
    ],
  },
  {
    id: "default",
    name: "Default",
    colors: ["oklch(1 0 0)", "oklch(0.2050 0 0)", "oklch(0.9700 0 0)"],
  },
  {
    id: "doom-64",
    name: "Doom 64",
    colors: [
      "oklch(0.8452 0 0)",
      "oklch(0.5016 0.1887 27.4816)",
      "oklch(0.5880 0.0993 245.7394)",
    ],
  },
  {
    id: "midnight-bloom",
    name: "Midnight Bloom",
    colors: [
      "oklch(0.9821 0 0)",
      "oklch(0.5676 0.2021 283.0838)",
      "oklch(0.6475 0.0642 117.4260)",
    ],
  },
  {
    id: "mocha",
    name: "Mocha",
    colors: [
      "oklch(0.9529 0.0146 102.4597)",
      "oklch(0.6083 0.0623 44.3588)",
      "oklch(0.8502 0.0389 49.0874)",
    ],
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    colors: [
      "oklch(1.0000 0 0)",
      "oklch(0.6231 0.1880 259.8145)",
      "oklch(0.9514 0.0250 236.8242)",
    ],
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    colors: [
      "oklch(0.9751 0.0127 244.2507)",
      "oklch(0.7227 0.1920 149.5793)",
      "oklch(0.9505 0.0507 163.0508)",
    ],
  },
  {
    id: "pastel-dreams",
    name: "Pastel Dreams",
    colors: [
      "oklch(0.9689 0.0090 314.7819)",
      "oklch(0.7090 0.1592 293.5412)",
      "oklch(0.9376 0.0260 321.9388)",
    ],
  },
  {
    id: "solar-dusk",
    name: "Solar Dusk",
    colors: [
      "oklch(0.9885 0.0057 84.5659)",
      "oklch(0.5553 0.1455 48.9975)",
      "oklch(0.9000 0.0500 74.9889)",
    ],
  },
  {
    id: "starry-night",
    name: "Starry Night",
    colors: [
      "oklch(0.9755 0.0045 258.3245)",
      "oklch(0.4815 0.1178 263.3758)",
      "oklch(0.6896 0.0714 234.0387)",
    ],
  },
  {
    id: "sunset-horizon",
    name: "Sunset Horizon",
    colors: [
      "oklch(0.9856 0.0084 56.3169)",
      "oklch(0.7357 0.1641 34.7091)",
      "oklch(0.8278 0.1131 57.9984)",
    ],
  },
  {
    id: "supabase",
    name: "Supabase",
    colors: [
      "oklch(0.9911 0 0)",
      "oklch(0.8348 0.1302 160.9080)",
      "oklch(0.9461 0 0)",
    ],
  },
  {
    id: "t3-chat",
    name: "T3 Chat",
    colors: [
      "oklch(0.9754 0.0084 325.6414)",
      "oklch(0.5316 0.1409 355.1999)",
      "oklch(0.8696 0.0675 334.8991)",
    ],
  },
  {
    id: "tangerine",
    name: "Tangerine",
    colors: [
      "oklch(0.9383 0.0042 236.4993)",
      "oklch(0.6397 0.1720 36.4421)",
      "oklch(0.9119 0.0222 243.8174)",
    ],
  },
  {
    id: "violet-bloom",
    name: "Violet Bloom",
    colors: [
      "oklch(0.9940 0 0)",
      "oklch(0.5393 0.2713 286.7462)",
      "oklch(0.9393 0.0288 266.3680)",
    ],
  },
];
