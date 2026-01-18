import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directory exists
function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

// Copy file with directory creation
function copyFile(src, dest) {
    ensureDirectoryExists(path.dirname(dest));
    fs.copyFileSync(src, dest);
}

// Create manifest.json
function createManifest(distDir) {
    const manifest = {
        "manifest_version": 3,
        "name": "BodhiTab",
        "version": "0.2.3",
        "description": "Replace your new tab with a beautiful, motivational dashboard",
        "author": "BodhiTab Team",
        "chrome_url_overrides": {
            "newtab": "index.html"
        },
        "permissions": [
            "storage"
        ],
        "host_permissions": [
            "https://bodhitab-quotes-api.vercel.app/*"
        ],
        "icons": {
            "16": "icons/icon16.png",
            "48": "icons/icon48.png",
            "128": "icons/icon128.png"
        },
        "content_security_policy": {
            "extension_pages": "script-src 'self'; object-src 'self'"
        },
        "web_accessible_resources": [
            {
                "resources": [
                    "js/*.js",
                    "css/*.css",
                    "icons/*.png",
                    "*.html"
                ],
                "matches": [
                    "<all_urls>"
                ]
            }
        ]
    };

    fs.writeFileSync(
        path.join(distDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );
}

// Main build function
function buildExtension() {
    const rootDir = path.resolve(__dirname, '..');
    const distDir = path.join(rootDir, 'dist');
    const publicDir = path.join(rootDir, 'public');

    // Ensure dist directory exists
    ensureDirectoryExists(distDir);
    ensureDirectoryExists(path.join(distDir, 'icons'));

    // Create manifest.json
    createManifest(distDir);

    // Copy icons to icons directory
    copyFile(
        path.join(publicDir, 'icon16.png'),
        path.join(distDir, 'icons', 'icon16.png')
    );
    copyFile(
        path.join(publicDir, 'icon48.png'),
        path.join(distDir, 'icons', 'icon48.png')
    );
    copyFile(
        path.join(publicDir, 'icon128.png'),
        path.join(distDir, 'icons', 'icon128.png')
    );

    console.log('✅ Extension build completed successfully!');
}

buildExtension(); 