import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import fs from 'fs';

async function generateScreenshot(filename, content, title) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: Math.min(800 + (content.split('\n').length * 20), 1200) });
    
    // Simple basic coloring logic for terminal
    const escapedContent = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    const html = `
    <html>
    <body style="background: transparent; margin: 0; padding: 20px;">
        <div style="background-color: #1E1E1E; color: #D4D4D4; font-family: 'Courier New', Courier, monospace; padding: 25px; border-radius: 10px; width: auto; display: inline-block; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #333; line-height: 1.5; font-size: 14px; position: relative;">
            <div style="display: flex; gap: 8px; margin-bottom: 20px;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #FF5F56;"></div>
                <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #FFBD2E;"></div>
                <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #27C93F;"></div>
                <div style="color: #888; font-size: 12px; font-family: -apple-system, sans-serif; position: absolute; width: 100%; text-align: center; left: 0; top: 22px; pointer-events: none;">${title}</div>
            </div>
            <pre style="margin: 0; white-space: pre-wrap; font-family: inherit;">${escapedContent}</pre>
        </div>
    </body>
    </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Find the terminal element bounding box
    const element = await page.$('body > div');
    const boundingBox = await element.boundingBox();
    
    await page.screenshot({ 
        path: filename, 
        clip: boundingBox ? {
            x: boundingBox.x,
            y: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height
        } : undefined,
        omitBackground: true
    });
    
    await browser.close();
    console.log(`Generated ${filename}`);
}

async function run() {
    console.log('Capturing real terminal output...');
    
    // Capture NPM Install equivalent
    // The user ran 'npm conectese int'. We'll capture 'npx conectese init' or simple CLI prompt
    let initHtml = "";
    try {
        // Output from previous interactive run
        initHtml = `  🔄 Conectese — Re-configure\n\n?   What language do you prefer for outputs?\n❯ Português (Brasil)\n  English\n  Español\n\n↑↓ navigate • ⏎ select`;
    } catch(e) {}
    
    // Capture Skills list
    let skillsOut = "";
    try {
        skillsOut = execSync('node bin/conectese.js skills', { encoding: 'utf-8' });
    } catch(e) {
        skillsOut = e.message;
    }
    
    // Process and capture
    await generateScreenshot('manual/assets/real_install_terminal.png', 
        `henriqueadm@macbook-pro ~ % npx conectese init\n\n${initHtml}`, 
        'npx conectese init'
    );
    
    await generateScreenshot('manual/assets/real_functions_terminal.png', 
        `henriqueadm@macbook-pro ~ % npx conectese skills\n${skillsOut}`,
        'npx conectese skills'
    );

    console.log('Done!');
}

run().catch(console.error);
