import { test, expect, Page } from '@playwright/test';


async function installMouseHelper(page: Page) {
    await page.addInitScript(() => {
        const ensureCursor = () => {
            let box = document.getElementById('mouse-helper');
            if (!box) {
                box = document.createElement('div');
                box.id = 'mouse-helper';
                const styleElement = document.createElement('style');
                styleElement.innerHTML = `
                    #mouse-helper {
                        pointer-events: none;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 40px; 
                        height: 40px;
                        background: radial-gradient(circle, rgba(255, 0, 0, 0.8) 0%, rgba(255, 0, 0, 0) 70%);
                        border: 2px solid rgba(255, 255, 255, 0.8);
                        border-radius: 50%;
                        margin-left: -20px;
                        margin-top: -20px;
                        transition: transform .1s;
                        z-index: 2147483647;
                        box-shadow: 0 0 15px rgba(255,0,0,0.8);
                    }
                    #mouse-helper.button-pressed {
                        transform: scale(0.6);
                        background: radial-gradient(circle, rgba(255, 255, 0, 0.8) 0%, rgba(255, 255, 0, 0) 70%);
                    }
                `;
                document.head.appendChild(styleElement);
                document.documentElement.appendChild(box);
            }
            return box;
        };

        const box = ensureCursor();

        document.addEventListener('mousemove', event => {
            const cursor = ensureCursor();
            cursor.style.left = event.clientX + 'px';
            cursor.style.top = event.clientY + 'px';
        }, true);

        document.addEventListener('mousedown', event => {
            const cursor = ensureCursor();
            cursor.classList.add('button-pressed');
        }, true);

        document.addEventListener('mouseup', event => {
            const cursor = ensureCursor();
            cursor.classList.remove('button-pressed');
        }, true);
    });
}

async function moveAndClick(page: Page, selector: string, label: string) {
    console.log(`[Step] Moving to and clicking: ${label} (${selector})`);
    try {
        const locator = page.locator(selector).first();
        await locator.scrollIntoViewIfNeeded();
        await locator.waitFor({ state: 'visible', timeout: 8000 });
        await expect(locator).toBeEnabled();

        const box = await locator.boundingBox();
        if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 50 });
            await page.waitForTimeout(200);
            await locator.click();
        } else {
            console.log(`[Warn] No bounding box for ${label}, falling back to click event`);
            await locator.click({ force: true });
        }
    } catch (e) {
        console.error(`[Error] Failed to interact with ${label}:`, e);
        throw e;
    }
}

async function moveAndSelect(page: Page, selector: string, value: string, label: string) {
    console.log(`[Step] Moving to and selecting: ${label} (${selector} -> ${value})`);
    await moveAndClick(page, selector, label);
    await page.locator(selector).first().selectOption(value);
}

test.describe('Project Creation and Build', () => {
    test.setTimeout(120000); 

    test('should create a project with SPI/I2C and trigger build', async ({ page }) => {
        await installMouseHelper(page);

        
        await page.goto('/');
        await page.waitForTimeout(1000);

        
        await moveAndClick(page, 'button:has-text("New Project")', 'New Project Button');
        await page.waitForTimeout(1000);

        
        const projectName = `e2e-demo-${Date.now()}`;
        console.log(`[Step] Filling Project Name: ${projectName}`);
        const inputLoc = page.getByLabel('Project Name');
        await inputLoc.scrollIntoViewIfNeeded();
        await inputLoc.waitFor({ state: 'visible' });
        const box = await inputLoc.boundingBox();
        if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 50 });
            await page.mouse.down();
            await page.mouse.up();
        }
        await inputLoc.fill(projectName);
        await page.waitForTimeout(1000);

        
        
        await moveAndClick(page, 'button:has-text("+ SPI")', 'Add SPI Button');
        await page.waitForTimeout(1000);

        
        await moveAndClick(page, 'button:has-text("+ I2C")', 'Add I2C Button');
        await page.waitForTimeout(1000);

        
        await moveAndSelect(page, 'select[title="SDA Pin"]', '4', 'I2C SDA Dropdown');
        await page.waitForTimeout(500);
        await moveAndSelect(page, 'select[title="SCL Pin"]', '5', 'I2C SCL Dropdown');
        await page.waitForTimeout(1000);

        
        
        
        await moveAndClick(page, 'button:text-is("+ ADC")', 'Add ADC Config Button');
        await page.waitForTimeout(1000);

        
        await moveAndClick(page, 'button:text-is("+ ADC Read")', 'Add ADC Read Button');
        await page.waitForTimeout(1000);

        
        await moveAndSelect(page, 'select:has-text("ADC0 (GP26)")', '26', 'ADC Config Pin 26');

        
        
        
        
        


        
        await moveAndClick(page, 'button:text-is("+ I2C Read")', 'Add I2C Read Button');
        await page.waitForTimeout(1000);

        
        await moveAndClick(page, 'button:has-text("Create Project")', 'Create Project Button');
        console.log('[Step] Project created, waiting for list...');
        await page.waitForTimeout(2000);

        
        console.log(`[Step] Looking for project: ${projectName}`);
        const projectItem = page.locator(`text=${projectName}`).first();
        await projectItem.scrollIntoViewIfNeeded();
        await projectItem.waitFor({ state: 'visible', timeout: 10000 });

        await moveAndClick(page, `text=${projectName}`, `Project Card (${projectName})`);
        await page.waitForTimeout(1000);

        
        
        console.log('[Step] Refreshing page to clear loading state...');
        await page.reload({ waitUntil: 'networkidle' });
        await installMouseHelper(page);
        await page.waitForTimeout(3000);

        
        console.log('[Step] Scroll through Code...');
        const editor = page.locator('.monaco-editor').first();
        await editor.waitFor({ state: 'visible', timeout: 10000 });
        const editorBox = await editor.boundingBox();
        if (editorBox) {
            
            await page.mouse.move(editorBox.x + editorBox.width / 2, editorBox.y + editorBox.height / 2, { steps: 50 });
            await page.waitForTimeout(500);

            
            await page.mouse.wheel(0, 500);
            await page.waitForTimeout(1000);

            
            await page.mouse.wheel(0, -500);
            await page.waitForTimeout(1000);
        }

        console.log('[Step] Creating Build...');
        
        const buildBtn = page.locator('button:has-text("Build")').first();
        await buildBtn.waitFor({ state: 'visible', timeout: 5000 });
        await expect(buildBtn).toBeEnabled();

        
        const btnBox = await buildBtn.boundingBox();
        if (btnBox) {
            console.log(`[Debug] Build button at: ${btnBox.x}, ${btnBox.y}`);
            await page.mouse.move(btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2, { steps: 20 });
            await page.waitForTimeout(500);
            await buildBtn.click();
        } else {
            await buildBtn.click({ force: true });
        }

        
        const logs = page.locator('div:has-text("Build Output")').locator('pre');
        try {
            await expect(async () => {
                const text = await logs.textContent();
                const btnText = await buildBtn.textContent();

                if (text && (text.includes('Starting build') || text.includes('Build finished'))) return;
                if (btnText?.includes('Building...')) return; 

                console.log('[Warn] Build not started, clicking again...');
                await buildBtn.click();
                await page.waitForTimeout(1000); 
                throw new Error('Retrying click...');
            }).toPass({ timeout: 10000, intervals: [2000] });
        } catch (e) {
            console.log('[Info] Proceeding to verify build output...');
        }

        console.log('Build triggered...');

        
        await expect(async () => {
            const text = await logs.textContent();
            if (text && text.includes('[System] Build finished.')) {
                return;
            }
            throw new Error('Build not finished yet');
        }).toPass({ timeout: 60000 });
    });
});
