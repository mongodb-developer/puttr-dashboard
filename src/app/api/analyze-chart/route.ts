import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: NextRequest) {
  try {
    const { imageData, prompt } = await request.json();

    const command = new ConverseCommand({
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      messages: [
        {
          role: 'user',
          content: [
            {
              text: prompt
            },
            {
              image: {
                format: 'png',
                source: {
                  bytes: Buffer.from(imageData.split(',')[1], 'base64')
                }
              }
            }
          ]
        }
      ],
      additionalModelRequestFields: {
        tools: [
          {
            type: "computer_20241022",
            name: "computer",
            display_height_px: 768,
            display_width_px: 1024,
            display_number: 0
          },
          {
            type: "bash_20241022",
            name: "bash"
          },
          {
            type: "text_editor_20241022",
            name: "str_replace_editor"
          }
        ],
        anthropic_beta: ["computer-use-2024-10-22"]
      }
    });

    const response = await bedrockClient.send(command);
    return NextResponse.json(response.output);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to analyze chart' }, { status: 500 });
  }
}
