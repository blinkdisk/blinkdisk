import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import satori from "satori";
import sharp from "sharp";

const fontsDir = join(process.cwd(), "public/fonts");

const inter400 = readFileSync(join(fontsDir, "inter-latin-400-normal.woff"));
const inter700 = readFileSync(join(fontsDir, "inter-latin-700-normal.woff"));

const logoSvg = `<svg viewBox="0 0 2794 415" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="153.987" y="47.9989" width="226.258" height="226.258" rx="42.4234" transform="rotate(45 153.987 47.9989)" stroke="white" stroke-width="21.2117" stroke-miterlimit="1" stroke-dasharray="45.96 45.96"/>
  <rect x="286.012" y="33" width="247.47" height="247.47" rx="53.0292" transform="rotate(45 286.012 33)" fill="white"/>
  <path d="M640 349V65H807.6C844.933 65 873.867 71.1333 894.4 83.4C914.933 95.6667 925.2 114.733 925.2 140.6C925.2 154.2 921.733 166.467 914.8 177.4C907.867 188.333 896.533 197 880.8 203.4C898.933 209.533 911.867 217.8 919.6 228.2C927.333 238.6 931.2 251.267 931.2 266.2C931.2 293.667 920.667 314.333 899.6 328.2C878.8 342.067 849.333 349 811.2 349H640ZM808 123H720V178.2H808C834.667 178.2 848 169.533 848 152.2V148.6C848 131.533 834.667 123 808 123ZM720 289.8H811.2C838.667 289.8 852.4 280.6 852.4 262.2V258.6C852.4 241.533 838.667 233 811.2 233H720V289.8Z" fill="white"/>
  <path d="M965.334 349V65H1042.93V349H965.334Z" fill="white"/>
  <path d="M1085.27 117V61H1162.07V117H1085.27ZM1084.47 349V143.4H1162.07V349H1084.47Z" fill="white"/>
  <path d="M1203.62 349V143.4H1280.02V163C1297.08 146.733 1322.15 138.6 1355.22 138.6C1366.15 138.6 1377.35 139.8 1388.82 142.2C1400.28 144.6 1410.82 148.867 1420.42 155C1430.02 160.867 1437.75 169.133 1443.62 179.8C1449.75 190.2 1452.82 203.4 1452.82 219.4V349H1375.22V227.4C1375.22 215.133 1370.95 206.333 1362.42 201C1353.88 195.4 1342.55 192.6 1328.42 192.6C1314.28 192.6 1302.95 195.4 1294.42 201C1285.88 206.333 1281.48 215.133 1281.22 227.4V349H1203.62Z" fill="white"/>
  <path d="M1492.29 349V65H1569.89V219.8L1660.29 143.4H1761.89L1663.89 223.4L1754.29 349H1659.09L1604.69 269.8L1569.89 298.2V349H1492.29Z" fill="white"/>
  <path d="M1775.94 349V65H1929.14C1966.74 65 1997.8 71.1333 2022.34 83.4C2047.14 95.6667 2065.67 112.6 2077.94 134.2C2090.2 155.533 2096.34 179.933 2096.34 207.4C2096.34 234.6 2090.2 258.867 2077.94 280.2C2065.67 301.533 2047.14 318.333 2022.34 330.6C1997.8 342.867 1966.74 349 1929.14 349H1775.94ZM1855.94 289.8H1923.54C1954.74 289.8 1977.8 282.867 1992.74 269C2007.94 255.133 2015.54 236.2 2015.54 212.2V201.8C2015.54 177.267 2007.94 158.2 1992.74 144.6C1977.8 131 1954.74 124.2 1923.54 124.2H1855.94V289.8Z" fill="white"/>
  <path d="M2130.59 117V61H2207.39V117H2130.59ZM2129.79 349V143.4H2207.39V349H2129.79Z" fill="white"/>
  <path d="M2363.33 353.8C2332.39 353.8 2305.46 349.667 2282.53 341.4C2259.86 333.133 2244.26 320.333 2235.73 303L2300.13 279.8C2302.26 283.267 2305.19 287 2308.93 291C2312.93 294.733 2319.19 297.933 2327.73 300.6C2336.26 303.267 2348.66 304.6 2364.93 304.6C2382.26 304.6 2396.13 303.533 2406.53 301.4C2417.19 299.267 2422.53 295.4 2422.53 289.8C2422.53 286.333 2420.93 283.667 2417.73 281.8C2414.79 279.667 2409.86 278.2 2402.93 277.4L2321.73 267.4C2307.06 265.533 2293.73 262.467 2281.73 258.2C2269.99 253.933 2260.66 247.8 2253.73 239.8C2247.06 231.8 2243.73 221.267 2243.73 208.2C2243.73 191.667 2248.79 178.333 2258.93 168.2C2269.33 157.8 2283.59 150.333 2301.73 145.8C2320.13 141 2341.06 138.6 2364.53 138.6C2395.46 138.6 2421.46 142.733 2442.53 151C2463.59 159.267 2478.93 172.6 2488.53 191L2426.13 208.6C2422.13 202.467 2415.73 197.533 2406.93 193.8C2398.39 189.8 2384.26 187.8 2364.53 187.8C2347.46 187.8 2334.66 189.133 2326.13 191.8C2317.59 194.2 2313.33 197.533 2313.33 201.8C2313.33 204.467 2314.79 206.867 2317.73 209C2320.66 211.133 2327.46 212.867 2338.13 214.2L2413.33 223.8C2429.59 225.667 2443.59 228.6 2455.33 232.6C2467.06 236.6 2476.13 242.467 2482.53 250.2C2488.93 257.933 2492.13 268.6 2492.13 282.2C2492.13 299 2486.53 312.733 2475.33 323.4C2464.13 333.8 2448.79 341.533 2429.33 346.6C2410.13 351.4 2388.13 353.8 2363.33 353.8Z" fill="white"/>
  <path d="M2523.54 349V65H2601.14V219.8L2691.54 143.4H2793.14L2695.14 223.4L2785.54 349H2690.34L2635.94 269.8L2601.14 298.2V349H2523.54Z" fill="white"/>
</svg>`;
const logoDataUri = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`;

type OgImageOptions = {
  title: string;
  description: string;
  badge?: string;
};

export async function generateOgImage({
  title,
  description,
  badge,
}: OgImageOptions): Promise<Buffer> {
  const truncatedDescription =
    description.length > 180 ? description.slice(0, 177) + "..." : description;
  const titleSize = title.length > 50 ? (badge ? 52 : 56) : badge ? 60 : 64;
  const gap = badge ? "32px" : "40px";
  const descriptionSize = badge ? "26px" : "28px";

  const logoElement = {
    type: "img",
    props: {
      src: logoDataUri,
      width: 240,
      height: 36,
      style: {
        height: "36px",
      },
    },
  };

  const headerChildren = badge
    ? [
        logoElement,
        {
          type: "div",
          props: {
            style: {
              backgroundColor: "rgba(139, 92, 246, 0.3)",
              color: "#a78bfa",
              fontSize: "18px",
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: "9999px",
            },
            children: badge,
          },
        },
      ]
    : [logoElement];

  const element = {
    type: "div",
    props: {
      style: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px",
        background:
          "linear-gradient(to bottom right, #0f0f0f 0%, #0f0f0f 40%, #2d1b4e 100%)",
        fontFamily: "Inter",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: badge ? "16px" : "12px",
                  },
                  children: headerChildren,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    color: "#ffffff",
                    fontSize: `${titleSize}px`,
                    fontWeight: 700,
                    lineHeight: 1.2,
                  },
                  children: title,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: descriptionSize,
                    lineHeight: 1.5,
                  },
                  children: truncatedDescription,
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(element as ReactNode, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Inter",
        data: inter400,
        weight: 400,
        style: "normal",
      },
      {
        name: "Inter",
        data: inter700,
        weight: 700,
        style: "normal",
      },
    ],
  });

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export function createOgImageResponse(png: Buffer): Response {
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
