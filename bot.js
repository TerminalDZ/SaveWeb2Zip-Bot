const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create zip directory if it doesn't exist
const zipDir = path.resolve(path.join(__dirname, 'zip'));
if (!fs.existsSync(zipDir)) {
    fs.mkdirSync(zipDir);
}

// Function to get page name from URL
function getPageNameFromUrl(url) {
    try {
        const urlPath = new URL(url).pathname;
        const fileName = path.basename(urlPath, '.html');
        return fileName === '' ? 'index' : fileName;
    } catch (error) {
        console.error('Error parsing URL:', error);
        return 'unknown';
    }
}

// Function to generate unique filename
function generateUniqueFilename(directory, baseName) {
    let fileName = `${baseName}.zip`;
    let counter = 1;
    
    while (fs.existsSync(path.join(directory, fileName))) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        fileName = `${baseName}_${timestamp}.zip`;
        counter++;
    }
    
    return fileName;
}

// Function to wait for download to start
function waitForDownloadStart(directory) {
    return new Promise((resolve) => {
        const checkDownload = () => {
            const files = fs.readdirSync(directory);
            const downloadingFiles = files.filter(file => file.endsWith('.crdownload'));
            
            if (downloadingFiles.length > 0) {
                resolve(downloadingFiles[0]);
            } else {
                setTimeout(checkDownload, 100);
            }
        };
        checkDownload();
    });
}

// Function to wait for specific file to complete downloading
function waitForSpecificFile(directory, downloadingFileName) {
    return new Promise((resolve, reject) => {
        const timeoutMs = 300000; // 5 minutes timeout
        const startTime = Date.now();
        
        const checkFile = () => {
            const files = fs.readdirSync(directory);
            const completedFileName = downloadingFileName.replace('.crdownload', '');
            
            if (files.includes(completedFileName)) {
                // Wait a bit to ensure the file is fully written
                setTimeout(() => resolve(completedFileName), 1000);
            } else if (Date.now() - startTime > timeoutMs) {
                reject(new Error('Download timeout'));
            } else {
                setTimeout(checkFile, 100);
            }
        };
        
        checkFile();
    });
}

// Function to rename downloaded file
function renameFile(directory, oldFileName, newFileName) {
    const oldPath = path.join(directory, oldFileName);
    const newPath = path.join(directory, newFileName);
    
    try {
        // Wait for the file to be fully available
        let retries = 0;
        while (retries < 10) {
            try {
                const stats = fs.statSync(oldPath);
                if (stats.size > 0) {
                    break;
                }
            } catch (e) {
                // File might not be accessible yet
            }
            retries++;
            // Wait 1 second before retry
            require('child_process').execSync('timeout /t 1');
        }

        fs.renameSync(oldPath, newPath);
        
        // Verify the file exists and has content
        const stats = fs.statSync(newPath);
        if (stats.size === 0) {
            throw new Error('Renamed file is empty');
        }
        
        console.log(`File successfully saved as: ${newFileName} (${stats.size} bytes)`);
        return true;
    } catch (error) {
        console.error('Error saving file:', error);
        return false;
    }
}

async function downloadWebsite(url, browser) {
    const page = await browser.newPage();
    
    try {
        // Set download behavior
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: zipDir
        });

        // Navigate to the website
        await page.goto('https://saveweb2zip.com/en', { waitUntil: 'networkidle0' });

        // Fill the URL input
        await page.type('input[name="websiteLink"]', url);

        // Check the required checkboxes
        await page.evaluate(() => {
            document.querySelector('input[name="isDefaultDownload"]').click();
            document.querySelector('input[name="isSaveStructure"]').click();
        });

        // Click the submit button
        await page.click('.main-form__btn');

        // Wait for download to start (button text changes)
        await page.waitForFunction(
            'document.querySelector(".main-form__btn-download").classList.contains("d-none") === false',
            { timeout: 30000 }
        );

        console.log(`Download started for ${url}`);
        
        // Wait for the .crdownload file to appear
        const downloadingFileName = await waitForDownloadStart(zipDir);
        console.log(`Detected download: ${downloadingFileName}`);
        
        // Wait for the specific file to complete downloading
        const completedFileName = await waitForSpecificFile(zipDir, downloadingFileName);
        console.log(`Download completed: ${completedFileName}`);
        
        // Generate unique filename based on the page name
        const pageName = getPageNameFromUrl(url);
        const uniqueFileName = generateUniqueFilename(zipDir, pageName);
        
        // Rename the file with the unique name
        const success = renameFile(zipDir, completedFileName, uniqueFileName);
        
        if (!success) {
            throw new Error('Failed to save file');
        }

        // Verify the file exists in the zip directory
        const finalPath = path.join(zipDir, uniqueFileName);
        if (!fs.existsSync(finalPath)) {
            throw new Error(`Final file ${uniqueFileName} not found in zip directory`);
        }

        // Close the page
        await page.close();
    } catch (error) {
        console.error(`Error processing ${url}:`, error);
        await page.close();
    }
}

async function main() {
    // Read URLs from JSON file
    const urls = JSON.parse(fs.readFileSync('urls.json', 'utf8'));
    
    // Launch browser
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    });

    // Process each URL
    for (const url of urls) {
        console.log(`\nProcessing: ${url}`);
        await downloadWebsite(url, browser);
    }

    // Close browser when done
    await browser.close();
    console.log('\nAll downloads completed!');
}

main().catch(console.error);
