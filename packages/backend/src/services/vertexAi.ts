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
