import { NextRequest, NextResponse } from 'next/server';
import { 
  PollyClient, 
  SynthesizeSpeechCommand,
  Engine,
  LanguageCode,
  OutputFormat,
  TextType,
  VoiceId,
  SynthesizeSpeechCommandInput
} from "@aws-sdk/client-polly";
import { Readable } from 'stream';

const pollyClient = new PollyClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { text } = await request.json();

    const input: SynthesizeSpeechCommandInput = {
      Engine: "neural" as Engine,
      LanguageCode: "en-US" as LanguageCode,
      OutputFormat: "mp3" as OutputFormat,
      Text: text,
      TextType: "text" as TextType,
      VoiceId: "Matthew" as VoiceId
    };

    const command = new SynthesizeSpeechCommand(input);
    const response = await pollyClient.send(command);

    // Convert the audio stream to a buffer
    if (!response.AudioStream) {
      throw new Error('No audio stream returned');
    }

    const stream = response.AudioStream as unknown as Readable;
    const chunks: Buffer[] = [];

    return await new Promise<Response>((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(new NextResponse(buffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
          },
        }));
      });
    });

  } catch (error) {
    console.error('Error synthesizing speech:', error);
    return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 500 });
  }
}
