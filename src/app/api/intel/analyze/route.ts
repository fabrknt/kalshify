// POST /api/intel/analyze - AI analysis of market signals

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface AnalyzeRequest {
  signal: {
    type: string;
    severity: string;
    ticker?: string;
    marketTitle?: string;
    title: string;
    description: string;
    data: Record<string, unknown>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { signal } = body;

    if (!signal) {
      return NextResponse.json(
        { error: 'Signal data required' },
        { status: 400 }
      );
    }

    const prompt = `You are a sharp market analyst at a trading terminal. Analyze this market signal and provide actionable insights.

SIGNAL DATA:
- Type: ${signal.type}
- Severity: ${signal.severity}
- Market: ${signal.marketTitle || 'Unknown'}
- Title: ${signal.title}
- Details: ${signal.description}
- Raw Data: ${JSON.stringify(signal.data, null, 2)}

Provide a brief analysis (3-4 sentences max) covering:
1. What this signal means for traders
2. Potential market implications
3. A quick trading recommendation (bullish/bearish/neutral)

Use a confident, terminal-style tone. Be direct and actionable. Include a confidence level (LOW/MEDIUM/HIGH).

Format your response as:
ANALYSIS: [Your analysis]
RECOMMENDATION: [BUY YES / BUY NO / HOLD / AVOID]
CONFIDENCE: [LOW/MEDIUM/HIGH]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    // Parse the structured response
    const analysisMatch = responseText.match(/ANALYSIS:\s*([\s\S]*?)(?=RECOMMENDATION:|$)/i);
    const recommendationMatch = responseText.match(/RECOMMENDATION:\s*(.*?)(?=CONFIDENCE:|$)/i);
    const confidenceMatch = responseText.match(/CONFIDENCE:\s*(LOW|MEDIUM|HIGH)/i);

    return NextResponse.json({
      success: true,
      analysis: {
        text: analysisMatch?.[1]?.trim() || responseText,
        recommendation: recommendationMatch?.[1]?.trim() || 'HOLD',
        confidence: confidenceMatch?.[1]?.trim() || 'MEDIUM',
        raw: responseText,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze signal',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
