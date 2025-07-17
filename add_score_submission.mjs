import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// The score submission code to add
const SCORE_SUBMISSION_CODE = `
    <script>
        // Score submission functionality
        let gameOverSent = false;
        
        // Function to send score to parent window
        function sendScore(score) {
            if (gameOverSent) return;
            
            gameOverSent = true;
            console.log('🎯 Game Over: score is', score);
            
            const origin = window.location.hostname.includes("localhost")
                ? "http://localhost:5173"
                : "https://fulboost.fun";
                
            window.parent.postMessage({ type: "GAME_OVER", score: score }, origin);
        }
        
        // Listen for game over events
        window.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'gameOver') {
                const score = e.data.score || 0;
                sendScore(score);
            }
        });
        
        // Check for Construct 2 runtime
        function checkForGameOver() {
            const runtime = window.cr_getC2Runtime ? window.cr_getC2Runtime() : null;
            if (runtime) {
                // Check for game over state periodically
                const checkInterval = setInterval(() => {
                    if (runtime.globalVars && typeof runtime.globalVars.GameOver !== 'undefined' && 
                        runtime.globalVars.GameOver && !gameOverSent) {
                        const score = runtime.globalVars.Score || 0;
                        sendScore(score);
                        clearInterval(checkInterval);
                    }
                }, 500);
            }
        }
        
        // For Phaser games
        if (window.Phaser) {
            // Listen for game over events in Phaser
            document.addEventListener('gameOver', function(e) {
                const score = e.detail && e.detail.score ? e.detail.score : 0;
                sendScore(score);
            });
        }
        
        // For Construct 2 games
        if (window.cr_getC2Runtime) {
            checkForGameOver();
        } else if (window.addEventListener) {
            window.addEventListener('cr_loaded', checkForGameOver);
        }
    </script>`;

// Function to update a single game's index.html
async function updateGameIndex(gameDir) {
    const indexPath = path.join(__dirname, gameDir, 'index.html');
    
    try {
        // Read the index.html file
        let content = await fs.promises.readFile(indexPath, 'utf8');
        
        // Check if score submission code already exists
        if (content.includes('function sendScore')) {
            console.log(`✅ Score submission already exists in ${gameDir}`);
            return;
        }
        
        // Insert the score submission code before the closing </body> tag
        const updatedContent = content.replace('</body>', `${SCORE_SUBMISSION_CODE}\n</body>`);
        
        // Write the updated content back to the file
        await fs.promises.writeFile(indexPath, updatedContent, 'utf8');
        console.log(`✅ Added score submission to ${gameDir}`);
        
    } catch (error) {
        console.error(`❌ Error updating ${gameDir}:`, error.message);
    }
}

// Main function to update all games
async function updateAllGames() {
    const gamesDir = __dirname;
    
    try {
        // Get all directories in the games folder
        const items = await fs.promises.readdir(gamesDir, { withFileTypes: true });
        const gameDirs = items
            .filter(item => item.isDirectory() && item.name !== '.git')
            .map(dir => dir.name);
        
        console.log(`Found ${gameDirs.length} games to update\n`);
        
        // Update each game
        for (const gameDir of gameDirs) {
            console.log(`Updating ${gameDir}...`);
            await updateGameIndex(gameDir);
        }
        
        console.log('\n🎉 All games have been updated with score submission functionality!');
    } catch (error) {
        console.error('Error processing games:', error);
        process.exit(1);
    }
}

// Run the updater
updateAllGames().catch(console.error);
