import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export class BedrockClient {
  private client: BedrockRuntimeClient;

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: process.env.NET_AWS_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_KEY || '',
            secretAccessKey: process.env.AWS_SECRET || '',
        },
    });
  }

  async captureChartDashboard(imageData: string, prompt: string): Promise<any> {
    const input = {
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/png",
                  data: imageData.split(',')[1]
                }
              }
            ]
          }
        ],
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
        anthropic_beta: ["computer-use-2024-10-22"],
        max_tokens: 4096,
        temperature: 0.7,
        top_p: 0.9
      }),
      contentType: "application/json",
      modelId: "anthropic.claude-3-5-sonnet-20241022-v2:0",
    };

    const command = new InvokeModelCommand(input);

    try {
      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody;
    } catch (error) {
      console.error('Error calling Bedrock:', error);
      throw error;
    }
  }
}

export const bedrockClient = new BedrockClient();
