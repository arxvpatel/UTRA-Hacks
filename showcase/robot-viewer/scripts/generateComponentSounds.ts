import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const SOUND_EFFECTS_URL = 'https://api.elevenlabs.io/v1/sound-generation';

// Define sound descriptions for each component category/type
const componentSounds: Record<string, { description: string; filename: string }> = {
  wheel: {
    description: 'Short rubber tire rolling on pavement with slight friction, mechanical rotation sound, 1 second',
    filename: 'wheel.mp3',
  },
  sensor: {
    description: 'High-pitched electronic beep sensor ping, infrared detection sound, sonar blip, 0.5 seconds',
    filename: 'sensor.mp3',
  },
  'ultrasonic-sensor': {
    description: 'Ultrasonic ping sound, sonar echo beep, high frequency pulse, 0.7 seconds',
    filename: 'ultrasonic-sensor.mp3',
  },
  'color-sensor': {
    description: 'Quick digital scanning beep, RGB sensor reading sound, electronic chirp, 0.6 seconds',
    filename: 'color-sensor.mp3',
  },
  arduino: {
    description: 'Computer processor beep, microcontroller startup sound, digital boot chirp, circuit activation, 0.8 seconds',
    filename: 'arduino.mp3',
  },
  'motor-driver': {
    description: 'Electric motor whir, servo motor activation, mechanical hum with slight buzz, 1 second',
    filename: 'motor-driver.mp3',
  },
  battery: {
    description: 'Electrical power on sound, gentle voltage hum, energy charging beep, 0.7 seconds',
    filename: 'battery.mp3',
  },
  breadboard: {
    description: 'Electronic circuit click, connector snap, PCB component placement sound, 0.4 seconds',
    filename: 'breadboard.mp3',
  },
  plate: {
    description: 'Metallic structural click, aluminum plate tap, chassis component sound, 0.5 seconds',
    filename: 'plate.mp3',
  },
};

async function generateSound(description: string, outputPath: string): Promise<void> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY environment variable is not set');
  }

  console.log(`\nGenerating sound: ${path.basename(outputPath)}`);
  console.log(`Description: ${description}`);

  try {
    const response = await fetch(SOUND_EFFECTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: description,
        duration_seconds: 1.5,
        prompt_influence: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Saved to: ${outputPath}`);
  } catch (error) {
    console.error(`✗ Failed to generate sound: ${error}`);
    throw error;
  }
}

async function main() {
  console.log('=== ElevenLabs Component Sound Generator ===\n');

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '../client/public/sounds/components');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}\n`);
  }

  // Generate each sound
  let successCount = 0;
  let failCount = 0;

  for (const [component, { description, filename }] of Object.entries(componentSounds)) {
    const outputPath = path.join(outputDir, filename);

    try {
      await generateSound(description, outputPath);
      successCount++;

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to generate ${component} sound`);
      failCount++;
    }
  }

  console.log('\n=== Generation Complete ===');
  console.log(`✓ Success: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);
  console.log(`\nSounds saved to: ${outputDir}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
