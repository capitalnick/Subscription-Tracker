import { VertexAI, type GenerativeModel } from '@google-cloud/vertexai';
import { config } from '../config.js';

let model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (!model) {
    if (!config.vertexAi.projectId) {
      throw new Error('GCP_PROJECT_ID is not configured');
    }
    const vertexAi = new VertexAI({
      project: config.vertexAi.projectId,
      location: config.vertexAi.location,
    });
    model = vertexAi.getGenerativeModel({ model: config.vertexAi.model });
  }
  return model;
}

interface ExtractedSubscription {
  merchantName: string;
  amount: number | null;
  currency: string | null;
  frequency: string | null;
  detectedDate: string | null;
  nextBilling: string | null;
  confidence: 'high' | 'low';
  notes: string | null;
}

const EXTRACTION_PROMPT = `You are a subscription detection assistant. Analyze the provided document and extract all recurring subscription charges.

For each subscription found, provide:
- merchantName: The service/company name (e.g., "Netflix", "Spotify")
- amount: The charge amount as a number
- currency: The currency code (default "AUD" for Australian documents)
- frequency: One of "weekly", "fortnightly", "monthly", "quarterly", "annual"
- detectedDate: The date of the charge (YYYY-MM-DD format)
- nextBilling: Estimated next billing date (YYYY-MM-DD format) if determinable
- confidence: "high" if clearly a recurring subscription, "low" if uncertain
- notes: Any relevant notes about the charge

Respond ONLY with a JSON array of subscription objects. If no subscriptions are found, return an empty array [].`;

const VALID_CATEGORIES = [
  'STREAMING_VIDEO', 'STREAMING_MUSIC', 'GAMING', 'PODCASTS_AUDIO',
  'PRODUCTIVITY', 'CLOUD_STORAGE', 'SOFTWARE_TOOLS', 'COMMUNICATION',
  'FITNESS', 'FOOD_DELIVERY', 'NEWS_MAGAZINES', 'INTERNET_PHONE',
  'UTILITIES_HOME', 'VPN_SECURITY', 'FINANCE_INVEST', 'SHOPPING_BOXES',
  'PRIME_MEMBERSHIPS', 'EDUCATION', 'OTHER',
] as const;

interface ResolvedMerchant {
  merchantName: string;
  websiteUrl: string | null;
  category: string;
}

const RESOLVE_PROMPT = (raw: string) =>
  `Given this bank statement descriptor: "${raw}", identify the merchant.
Return a JSON object with these fields:
- merchantName: The clean, human-readable company name (e.g., "Netflix" not "NFLX DIGITAL")
- websiteUrl: The merchant's primary website URL (e.g., "https://netflix.com") or null if unknown
- category: One of: ${VALID_CATEGORIES.join(', ')}

Return ONLY valid JSON. Example: {"merchantName":"Netflix","websiteUrl":"https://netflix.com","category":"STREAMING_VIDEO"}`;

export async function resolveUnknownMerchant(rawDescriptor: string): Promise<ResolvedMerchant> {
  try {
    const result = await getModel().generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: RESOLVE_PROMPT(rawDescriptor) }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 256,
        responseMimeType: 'application/json',
      },
    });

    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const parsed = JSON.parse(text);

    const category = VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'OTHER';

    return {
      merchantName: parsed.merchantName || rawDescriptor,
      websiteUrl: parsed.websiteUrl || null,
      category,
    };
  } catch (error) {
    console.error('resolveUnknownMerchant failed:', error);
    return { merchantName: rawDescriptor, websiteUrl: null, category: 'OTHER' };
  }
}

export async function extractSubscriptions(
  buffer: Buffer,
  type: 'pdf' | 'screenshot',
): Promise<ExtractedSubscription[]> {
  const mimeType = type === 'pdf' ? 'application/pdf' : 'image/jpeg';

  const result = await getModel().generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { text: EXTRACTION_PROMPT },
          {
            inlineData: {
              mimeType,
              data: buffer.toString('base64'),
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  });

  const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';

  try {
    return JSON.parse(text) as ExtractedSubscription[];
  } catch {
    console.error('Failed to parse Vertex AI response:', text);
    return [];
  }
}
