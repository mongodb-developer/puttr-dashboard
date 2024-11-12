import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Browser } from 'puppeteer';

let browserInstance: Browser | null = null;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true
    });
  }
  return browserInstance;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    // Set initial viewport
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    // Enable JavaScript in iframes
    await page.setBypassCSP(true);

    // Navigate with less strict wait condition
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Wait for iframe to load
    await page.waitForSelector('iframe', { timeout: 10000 });

    // Wait for charts to load in iframe
    const frames = page.frames();
    for (const frame of frames) {
      try {
        // Wait for any visible chart elements (SVG, canvas, or chart containers)
        await Promise.race([
          frame.waitForSelector('svg', { timeout: 5000, visible: true }),
          frame.waitForSelector('canvas', { timeout: 5000, visible: true }),
          frame.waitForSelector('[data-testid="chart-container"]', { timeout: 5000, visible: true })
        ]);
      } catch (err) {
        console.log('Frame might not contain charts, continuing...');
      }
    }

    // Additional wait to ensure charts are rendered
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get the full height including iframe content
    const height = await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe');
      let maxHeight = document.documentElement.scrollHeight;
      
      iframes.forEach(iframe => {
        try {
          // Try to get the actual content height from the iframe
          const iframeDoc = iframe.contentWindow?.document;
          if (iframeDoc) {
            const scrollHeight = iframeDoc.documentElement.scrollHeight;
            const bodyHeight = iframeDoc.body.scrollHeight;
            const contentHeight = Math.max(scrollHeight, bodyHeight);
            maxHeight = Math.max(maxHeight, iframe.offsetTop + contentHeight + 200);
          }
        } catch (e) {
          console.log('Error measuring iframe height, using fallback');
          // Fallback to a reasonable height if we can't measure
          maxHeight = Math.max(maxHeight, iframe.offsetTop + 800);
        }
      });

      return maxHeight;
    });

    // Update viewport to match content height
    await page.setViewport({
      width: 1920,
      height: Math.min(height, 15000), // Limit maximum height
      deviceScaleFactor: 1,
    });

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
      captureBeyondViewport: true
    });

    await page.close();

    return new NextResponse(screenshot, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.error('Error taking screenshot:', error);
    return NextResponse.json({ error: 'Failed to take screenshot' }, { status: 500 });
  }
}

// Cleanup browser instance when the API is shutting down
process.on('SIGTERM', async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
});
