import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type { CommunityPost, EwasteAnalysis } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '12mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DATA_DIR = path.resolve(__dirname, 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

const SEED_POSTS: CommunityPost[] = [
  {
    id: 'seed-router-1',
    authorName: 'Maya R.',
    userNote: 'Replaced this old dual-antenna Wi-Fi router. Works electrically, just slow.',
    imageUrl: '/src/assets/images/ewaste_post_router_1794824458958.jpg',
    createdAt: '2026-11-15T14:20:00.000Z',
    helpfulCount: 18,
    analysis: {
      itemName: 'Dual-Antenna Wi-Fi Router & 12V Power Brick',
      category: 'Networking & Power',
      confidence: 'High',
      hazardLevel: 'Safe to Handle',
      summary:
        'A consumer 802.11n/ac wireless router with detachable RP-SMA antennas and a standard 12V DC wall adapter.',
      diyMethods: [
        {
          title: 'Turn into a Garage / Shed Wi-Fi Extender',
          effort: 'Quick (5 min)',
          toolsNeeded: ['Ethernet cable', 'Paperclip (reset pin)'],
          steps: [
            'Hold the rear Reset button with a paperclip for 10 seconds to wipe old credentials.',
            'Connect a laptop via Ethernet, open the admin page, and switch the mode to Access Point (AP Mode).',
            'Disable DHCP, match your home Wi-Fi name, and plug it into any dead-zone room via cable.',
          ],
          outcome: 'Saves buying a new Wi-Fi extender and keeps the router in active use.',
        },
        {
          title: 'Harvest the 12V DC Power Adapter & Antennas',
          effort: 'Quick (5 min)',
          toolsNeeded: ['Scissors or electrical tape (if adapting plug)'],
          steps: [
            'Unplug and keep the 12V DC wall brick — it powers LED strip lights, mini fans, and desktop speakers.',
            'Unscrew the two external antennas to keep as replacements or magnetic-mount extenders for PC Wi-Fi cards.',
          ],
          outcome: 'Gives you a reliable 12V power supply and spare RF antennas for home projects.',
        },
      ],
      safeAtHomePrep: [
        'Factory-reset the router for 15 seconds while powered on so your old Wi-Fi password is erased.',
        'If the plastic shell is cracked beyond reuse, unscrew the casing and store the small circuit board in a dry labeled box until you have a bundle of clean PCBs.',
      ],
      safetyWarnings: [
        'Unplug the wall adapter completely before opening the plastic housing.',
        'Do not burn the ABS plastic shell or PVC power cord.',
      ],
      reusableParts: ['12V DC Power Brick', '2x RP-SMA Antennas', 'LED Indicators', 'Aluminum Heatsink'],
    },
  },
  {
    id: 'seed-earbuds-2',
    authorName: 'Devon K.',
    userNote: 'Left earbud stopped playing and the Lightning cable sheath split near the plug.',
    imageUrl: '/src/assets/images/ewaste_post_earbuds_1794824460282.jpg',
    createdAt: '2026-11-15T09:45:00.000Z',
    helpfulCount: 24,
    analysis: {
      itemName: 'Broken Wired Earphones & Frayed USB Charging Cable',
      category: 'Cables & Chargers',
      confidence: 'High',
      hazardLevel: 'Safe to Handle',
      summary:
        'Tangled 3.5mm wired earbuds with damaged insulation alongside a frayed USB-A charging cable.',
      diyMethods: [
        {
          title: 'Rescue Micro Neodymium Magnets from Earbuds',
          effort: 'Quick (5 min)',
          toolsNeeded: ['Small flathead screwdriver or butter knife', 'Work gloves'],
          steps: [
            'Snap open the plastic earbud shells gently along the seam using a flat tool.',
            'Lift out the tiny circular speaker driver inside each bud.',
            'Peel the strong mini neodymium magnet off the back of the speaker coil for fridge notes or screw trays.',
          ],
          outcome: 'Turns dead earbuds into super-strong miniature magnets for your desk or workshop.',
        },
        {
          title: 'Salvage Good Copper Wire & Secure Frayed Cable Ends',
          effort: 'Project (20–30 min)',
          toolsNeeded: ['Wire cutters or heavy scissors', 'Heat-shrink tubing or electrical tape'],
          steps: [
            'If the USB cable still charges when held straight, reinforce the frayed neck with two snug layers of heat-shrink or tape.',
            'If dead, snip off the damaged plug and keep the intact middle copper cable length for low-voltage 5V LED or battery craft wiring.',
          ],
          outcome: 'Eliminates fire risk from exposed strands while saving clean insulated copper wire.',
        },
      ],
      safeAtHomePrep: [
        'Never keep using a frayed charging cord near bedding or rugs — coil and snip the broken connector off immediately so nobody plugs it in.',
        'Keep harvested neodymium magnets away from young children and pets.',
      ],
      safetyWarnings: [
        'Never strip or burn PVC cable insulation with a lighter (releases toxic hydrochloric fumes).',
        'Discard frayed charging connectors immediately so they cannot short-circuit a USB port.',
      ],
      reusableParts: ['2x Micro Neodymium Magnets', '3.5mm Gold-Plated Plug', 'Insulated Copper Wire', 'Inline Microphone'],
    },
  },
  {
    id: 'seed-keyboard-3',
    authorName: 'Samira T.',
    userNote: 'Missing the D keycap and mouse scroll wheel skips.',
    imageUrl: '/src/assets/images/ewaste_post_keyboard_1794824460002.jpg',
    createdAt: '2026-11-14T18:10:00.000Z',
    helpfulCount: 15,
    analysis: {
      itemName: 'Membrane Desktop Keyboard & Optical Mouse',
      category: 'Audio & Peripherals',
      confidence: 'High',
      hazardLevel: 'Safe to Handle',
      summary:
        'Standard desktop membrane keyboard with a missing keycap paired with an older optical mouse.',
      diyMethods: [
        {
          title: '5-Minute Keycap Swap & Mouse Wheel Fix',
          effort: 'Quick (5 min)',
          toolsNeeded: ['Cotton swab', 'Rubbing alcohol', 'Small Phillips screwdriver'],
          steps: [
            'Swap a rarely used keycap (like Scroll Lock or Pause) onto the missing D stem so the keyboard works comfortably again.',
            'Remove the single screw under the mouse, blow out dust around the scroll wheel axle, and wipe the optical sensor lens with a dry swab.',
          ],
          outcome: 'Restores both peripherals to working backup duty in under 10 minutes.',
        },
        {
          title: 'Upcycle Keycaps & USB Cable for Crafts/Repairs',
          effort: 'Upcycle',
          toolsNeeded: ['Butter knife or keycap puller', 'Warm soapy water', 'Hot glue or superglue'],
          steps: [
            'Pop off all keycaps and wash them in warm soapy water.',
            'Glue favorite letter keys onto small flat magnets or wooden tiles for custom fridge word magnets, luggage tags, or coaster borders.',
            'Remove the AA battery (if wireless) and store it separately; keep the intact USB cord for 5V DIY lamps.',
          ],
          outcome: 'Turns ~104 plastic keycaps into playful home organizers instead of landfill plastic.',
        },
      ],
      safeAtHomePrep: [
        'Always check underneath the keyboard and mouse for AA/AAA batteries before storing or repurposing.',
        'Wipe down grime with mild soap before crafting with the keycaps.',
      ],
      safetyWarnings: [
        'Check for leaking alkaline batteries inside battery compartments and handle crust with gloves.',
      ],
      reusableParts: ['100+ Keycaps', 'Mouse Microswitches', 'Optical Lens', 'Rubber Feet', 'USB Cable'],
    },
  },
];

function ensurePostsFile(): CommunityPost[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(POSTS_FILE)) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(SEED_POSTS, null, 2), 'utf-8');
    return SEED_POSTS;
  }
  try {
    const raw = fs.readFileSync(POSTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_POSTS;
  } catch {
    return SEED_POSTS;
  }
}

function savePosts(posts: CommunityPost[]) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts.slice(0, 60), null, 2), 'utf-8');
}

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    itemName: {
      type: Type.STRING,
      description: 'Clear, specific name of the electronic waste item shown in the image.',
    },
    category: {
      type: Type.STRING,
      description:
        'Must be one of: Cables & Chargers, Mobile & Batteries, Audio & Peripherals, Networking & Power, Small Appliances, Computing & Boards',
    },
    confidence: {
      type: Type.STRING,
      description: 'Must be one of: High, Medium, Low',
    },
    hazardLevel: {
      type: Type.STRING,
      description: 'Must be one of: Safe to Handle, Handle with Care, High Caution',
    },
    summary: {
      type: Type.STRING,
      description: 'Concise 1-2 sentence plain-English identification of the item and its condition.',
    },
    diyMethods: {
      type: Type.ARRAY,
      description:
        '2 to 3 practical at-home DIY methods the user can do themselves without visiting a recycling center (repair, repurpose, harvest reusable parts, upcycle).',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          effort: {
            type: Type.STRING,
            description: 'Must be one of: Quick (5 min), Project (20–30 min), Upcycle',
          },
          toolsNeeded: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          outcome: { type: Type.STRING },
        },
        required: ['title', 'effort', 'toolsNeeded', 'steps', 'outcome'],
      },
    },
    safeAtHomePrep: {
      type: Type.ARRAY,
      description:
        'Practical at-home steps to neutralize hazards, wipe data, tape battery terminals, or safely store/prepare the item without needing an immediate recycling center trip.',
      items: { type: Type.STRING },
    },
    safetyWarnings: {
      type: Type.ARRAY,
      description: 'Clear safety warnings (what NOT to puncture, burn, or open at home).',
      items: { type: Type.STRING },
    },
    reusableParts: {
      type: Type.ARRAY,
      description: 'Useful components that can be salvaged at home (magnets, copper wire, screws, adapters, etc.).',
      items: { type: Type.STRING },
    },
  },
  required: [
    'itemName',
    'category',
    'confidence',
    'hazardLevel',
    'summary',
    'diyMethods',
    'safeAtHomePrep',
    'safetyWarnings',
    'reusableParts',
  ],
};

function getErrorText(err: unknown): string {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}`;
  }
  return String(err);
}

function isTransientError(err: unknown): boolean {
  const msg = getErrorText(err);
  return (
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('high demand') ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('500') ||
    msg.includes('INTERNAL') ||
    msg.includes('TimeoutError') ||
    msg.includes('AbortError') ||
    msg.toLowerCase().includes('timeout') ||
    msg.toLowerCase().includes('aborted')
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.post('/api/analyze-ewaste', async (req, res) => {
  try {
    const { imageBase64, mimeType, note } = req.body as {
      imageBase64?: string;
      mimeType?: string;
      note?: string;
    };

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Please provide an image of your e-waste item.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key is not configured. Check Settings > Secrets to set GEMINI_API_KEY.',
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    const safeMime = mimeType && mimeType.startsWith('image/') ? mimeType : 'image/jpeg';

    const promptText = [
      'Identify the electronic waste item in this photograph.',
      note && note.trim() ? `User note about the item: "${note.trim()}"` : '',
      'Provide practical, safe, step-by-step ways the person can handle, repair, repurpose, harvest parts from, or safely neutralize/store it AT HOME themselves WITHOUT needing to drive to a recycling center.',
      'Be strictly honest about safety: if the item contains a swollen lithium-ion battery, mercury lamp (CFL), or CRT glass, set hazardLevel to "High Caution", warn them NEVER to puncture or crush it, and give clear at-home containment steps (such as taping terminals, placing in a dry sand/baking-soda glass jar, or keeping away from heat) plus safe home alternatives instead of risky disassembly.',
    ]
      .filter(Boolean)
      .join(' ');

    const systemInstruction =
      'You are ReCircuit, an expert practical electronics repairer and home e-waste safety advisor. You help everyday people identify household e-waste from photos and give clear, jargon-free, actionable DIY steps they can do themselves at home without needing a recycling center. Never recommend unsafe burning, acid leaching, or puncturing batteries.';

    const attempts: Array<{ model: string; thinkingLevel?: ThinkingLevel; delayMs: number }> = [
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayMs: 0 },
      { model: 'gemini-3.1-flash-lite', delayMs: 250 },
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayMs: 600 },
    ];

    let response;
    let lastError: unknown;

    for (const attempt of attempts) {
      if (attempt.delayMs > 0) {
        await sleep(attempt.delayMs);
      }
      try {
        response = await ai.models.generateContent({
          model: attempt.model,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: safeMime,
                  data: cleanBase64,
                },
              },
              { text: promptText },
            ],
          },
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
            ...(attempt.thinkingLevel ? { thinkingConfig: { thinkingLevel: attempt.thinkingLevel } } : {}),
            abortSignal: AbortSignal.timeout(15000),
          },
        });
        break;
      } catch (err) {
        lastError = err;
        console.warn(`Gemini attempt failed on ${attempt.model}:`, getErrorText(err));
        if (!isTransientError(err)) {
          throw err;
        }
      }
    }

    if (!response) {
      throw lastError ?? new Error('503 UNAVAILABLE');
    }

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      return res.status(502).json({ error: 'AI did not return a recognition result. Please try a clearer photo.' });
    }

    const parsed = JSON.parse(rawText) as EwasteAnalysis;
    return res.json({ analysis: parsed });
  } catch (err: unknown) {
    console.error('Error analyzing e-waste:', err);
    const message = getErrorText(err);
    if (message.includes('PERMISSION_DENIED') || message.includes('API_KEY_INVALID')) {
      return res.status(403).json({
        error: 'Invalid or missing Gemini API key. Please verify GEMINI_API_KEY in Settings > Secrets.',
      });
    }
    if (
      message.includes('503') ||
      message.includes('UNAVAILABLE') ||
      message.includes('high demand') ||
      message.includes('TimeoutError') ||
      message.includes('AbortError') ||
      message.toLowerCase().includes('timeout')
    ) {
      return res.status(503).json({
        error: 'The AI recognition service is experiencing a temporary spike in demand. Please tap Try Again in a few seconds.',
      });
    }
    if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
      return res.status(429).json({
        error: 'AI request quota temporarily reached. Please wait a moment and try again.',
      });
    }
    return res.status(500).json({ error: 'Could not analyze this photo right now. Please try again.' });
  }
});

app.get('/api/posts', (_req, res) => {
  const posts = ensurePostsFile();
  return res.json({ posts });
});

app.post('/api/posts', (req, res) => {
  try {
    const { authorName, userNote, imageUrl, analysis } = req.body as {
      authorName?: string;
      userNote?: string;
      imageUrl?: string;
      analysis?: EwasteAnalysis;
    };

    if (!imageUrl || !analysis || !analysis.itemName) {
      return res.status(400).json({ error: 'Missing required post image or analysis data.' });
    }

    const posts = ensurePostsFile();
    const newPost: CommunityPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      authorName: (authorName || '').trim() || 'Community Member',
      userNote: (userNote || '').trim() || undefined,
      imageUrl,
      createdAt: new Date().toISOString(),
      helpfulCount: 1,
      analysis,
    };

    const updated = [newPost, ...posts];
    savePosts(updated);
    return res.status(201).json({ post: newPost });
  } catch (err) {
    console.error('Failed to save community post:', err);
    return res.status(500).json({ error: 'Could not publish post.' });
  }
});

app.post('/api/posts/:id/helpful', (req, res) => {
  const posts = ensurePostsFile();
  const idx = posts.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Post not found.' });
  }
  posts[idx] = {
    ...posts[idx],
    helpfulCount: posts[idx].helpfulCount + 1,
  };
  savePosts(posts);
  return res.json({ post: posts[idx] });
});

app.get('/api/android-apk-kit', async (req, res) => {
  try {
    const hostOrigin =
      process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL'
        ? process.env.APP_URL.replace(/\/$/, '')
        : `${req.protocol}://${req.get('host')}`;
    const hostDomain = hostOrigin.replace(/^https?:\/\//, '').split('/')[0];

    const zip = new JSZip();

    const twaManifest = {
      packageId: 'app.recircuit.ewaste',
      host: hostDomain,
      name: 'ReCircuit — DIY E-Waste Guide',
      launcherName: 'ReCircuit',
      display: 'standalone',
      themeColor: '#0F766E',
      navigationColor: '#0F766E',
      backgroundColor: '#F7F8F6',
      enableNotifications: false,
      startUrl: '/',
      iconUrl: `${hostOrigin}/pwa-512x512.png`,
      maskableIconUrl: `${hostOrigin}/pwa-maskable-512x512.png`,
      splashScreenFadeOutDuration: 300,
      signingKey: {
        path: './android.keystore',
        alias: 'recircuit',
      },
      appVersionName: '1.0.0',
      appVersionCode: 1,
      shortcuts: [
        {
          name: 'Scan E-Waste',
          shortName: 'Scan',
          url: '/?tab=scan',
          chosenIconUrl: `${hostOrigin}/pwa-192x192.png`,
        },
      ],
      generatorApp: 'bubblewrap-cli',
      webManifestUrl: `${hostOrigin}/manifest.webmanifest`,
      fallbackType: 'customtabs',
      orientation: 'portrait',
    };

    const capacitorConfig = {
      appId: 'app.recircuit.ewaste',
      appName: 'ReCircuit',
      webDir: 'dist',
      server: {
        url: hostOrigin,
        cleartext: false,
      },
      android: {
        allowMixedContent: false,
        captureInput: true,
        webContentsDebuggingEnabled: false,
      },
    };

    const buildScript = `#!/usr/bin/env bash
set -e

echo "=== ReCircuit Android APK Builder (Bubblewrap TWA) ==="
if ! command -v bubblewrap &> /dev/null; then
  echo "Installing @bubblewrap/cli globally..."
  npm install -g @bubblewrap/cli
fi

echo "Building signed Android APK from twa-manifest.json..."
bubblewrap update
bubblewrap build

echo "Done! Your installable APK is ready: app-release-signed.apk"
`;

    const readme = `# ReCircuit — Android APK Builder Kit

This package gives you everything needed to compile a standalone Android \`.apk\` file pointing to your live ReCircuit app (${hostOrigin}).

## Fastest Way on Android (No PC Needed)
1. Open **${hostOrigin}** in **Google Chrome** on your Android phone.
2. Tap **"Install App"** inside ReCircuit (or Chrome menu -> **Add to Home screen / Install app**).
3. Android Chrome automatically packages and installs a native **WebAPK** onto your device with its own app icon and standalone window.

## Compile a Standalone \`.apk\` File (Bubblewrap TWA)
Requirements: Node.js 18+ and Java JDK 17 (Bubblewrap will download the Android SDK automatically on first run).

1. Unzip this folder and open a terminal inside it.
2. Run:
   \`\`\`bash
   npm install -g @bubblewrap/cli
   bubblewrap init --manifest=${hostOrigin}/manifest.webmanifest
   bubblewrap build
   \`\`\`
   Or run \`bash build-apk.sh\` using the prefilled \`twa-manifest.json\`.
3. Transfer the generated \`app-release-signed.apk\` to any Android device to install.

## Alternative: Capacitor + Android Studio
Use the included \`capacitor.config.json\` inside a Capacitor project and run \`npx cap add android && npx cap open android\` to build via Android Studio.
`;

    zip.file('README.md', readme);
    zip.file('twa-manifest.json', JSON.stringify(twaManifest, null, 2));
    zip.file('capacitor.config.json', JSON.stringify(capacitorConfig, null, 2));
    zip.file('build-apk.sh', buildScript, { unixPermissions: '755' });

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="recircuit-android-apk-kit.zip"');
    return res.send(buffer);
  } catch (err) {
    console.error('Failed to generate Android APK kit:', err);
    return res.status(500).json({ error: 'Could not generate Android APK kit.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReCircuit server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
