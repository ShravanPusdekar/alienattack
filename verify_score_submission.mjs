import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to ignore
const IGNORED_DIRS = new Set(['.git', 'node_modules', '.vscode', '__pycache__']);

// The score submission code we're looking for
const REQUIRED_CODE_SNIPPETS = [
    'function sendScore',
    'window.parent.postMessage',
    'initializeScoreTracking',
    'checkConstruct2Game',
    'checkBalanceBall',
    'checkPhaserGame'
];

async function checkGame(gameDir) {
    const indexPath = path.join(gameDir, 'index.html');
    
    try {
        const content = await fs.readFile(indexPath, 'utf-8');
        const missingSnippets = REQUIRED_CODE_SNIPPETS.filter(snippet => !content.includes(snippet));
        
        return {
            name: path.basename(gameDir),
            hasScoreSubmission: missingSnippets.length === 0,
            missingSnippets,
            path: indexPath
        };
    } catch (error) {
        return {
            name: path.basename(gameDir),
            error: error.message,
            path: indexPath
        };
    }
}

async function main() {
    const gamesPath = __dirname;
    const entries = await fs.readdir(gamesPath, { withFileTypes: true });
    const gameDirs = entries
        .filter(entry => 
            entry.isDirectory() && 
            !entry.name.startsWith('.') && 
            !IGNORED_DIRS.has(entry.name)
        )
        .map(dir => path.join(gamesPath, dir.name));

    console.log(`\n🔍 Checking ${gameDirs.length} games for score submission implementation...\n`);
    
    const results = [];
    for (const gameDir of gameDirs) {
        const result = await checkGame(gameDir);
        results.push(result);
        
        const status = result.error 
            ? `❌ Error: ${result.error}`
            : result.hasScoreSubmission 
                ? '✅ Score submission found' 
                : `❌ Missing: ${result.missingSnippets.join(', ')}`;
                
        console.log(`${result.name.padEnd(20)} ${status}`);
    }
    
    const successCount = results.filter(r => !r.error && r.hasScoreSubmission).length;
    const missingCount = results.filter(r => !r.error && !r.hasScoreSubmission).length;
    const errorCount = results.filter(r => r.error).length;
    
    console.log('\n📊 Summary:');
    console.log(`✅ ${successCount} games with score submission`);
    console.log(`❌ ${missingCount} games missing score submission`);
    console.log(`⚠️  ${errorCount} games had errors`);
    
    // Log games that need attention
    const needsAttention = results.filter(r => r.error || !r.hasScoreSubmission);
    if (needsAttention.length > 0) {
        console.log('\n🔧 Games that need attention:');
        needsAttention.forEach(game => {
            console.log(`\n${game.name}:`);
            if (game.error) {
                console.log(`  ❌ Error: ${game.error}`);
            } else {
                console.log(`  ❌ Missing code snippets: ${game.missingSnippets.join(', ')}`);
            }
            console.log(`  📂 ${game.path}`);
        });
    }
}

main().catch(console.error);
