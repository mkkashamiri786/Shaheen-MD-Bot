const fs = require('fs');
const path = require('path');

const WARN_FILE = path.join(__dirname, '..', 'database', 'warnings.json');

// Load warnings
function loadWarnings() {
    try {
        if (!fs.existsSync(WARN_FILE)) {
            fs.mkdirSync(path.dirname(WARN_FILE), { recursive: true });
            fs.writeFileSync(WARN_FILE, '{}');
            return {};
        }
        return JSON.parse(fs.readFileSync(WARN_FILE, 'utf8'));
    } catch {
        return {};
    }
}

// Save warnings
function saveWarnings(data) {
    try {
        fs.mkdirSync(path.dirname(WARN_FILE), { recursive: true });
        fs.writeFileSync(WARN_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Warn save error:', e);
    }
}

module.exports = async (sock, from, msg) => {
    try {
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, {
                text: '❌ Yeh command sirf groups mein kaam karti hai.'
            }, { quoted: msg });
        }

        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const mentioned = contextInfo?.mentionedJid || [];
        const sender = contextInfo?.participant || msg.key.participant;

        if (!mentioned.length) {
            return await sock.sendMessage(from, {
                text: '⚠️ Kisi member ko mention karke .warn likhein.'
            }, { quoted: msg });
        }

        const groupMetadata = await sock.groupMetadata(from);

        const normalize = (id) => id.split(':')[0].split('@')[0];

        const botId = normalize(sock.user.id);
        const senderId = normalize(sender);

        const botParticipant = groupMetadata.participants.find(
            p => normalize(p.id) === botId
        );
        const senderParticipant = groupMetadata.participants.find(
            p => normalize(p.id) === senderId
        );

        // 1. Bot admin check
        if (!botParticipant?.admin) {
            return await sock.sendMessage(from, {
                text: '❌ Bot ko group admin banayein.'
            }, { quoted: msg });
        }

        // 2. Sender admin check
        if (!senderParticipant?.admin) {
            return await sock.sendMessage(from, {
                text: '❌ Sirf group admin warn kar sakte hain.'
            }, { quoted: msg });
        }

        // 3. Bot ko warn na kare
        const filtered = mentioned.filter(m => normalize(m) !== botId);
        if (!filtered.length) {
            return await sock.sendMessage(from, {
                text: '❌ Bot ko warn nahi kar sakte.'
            }, { quoted: msg });
        }

        // 4. Admin ko warn na kare
        const admins = groupMetadata.participants
            .filter(p => p.admin)
            .map(p => normalize(p.id));

        const targets = filtered.filter(m => !admins.includes(normalize(m)));
        if (!targets.length) {
            return await sock.sendMessage(from, {
                text: '❌ Admin ko warn nahi kar sakte.'
            }, { quoted: msg });
        }

        // 5. Warnings update
        const db = loadWarnings();
        if (!db[from]) db[from] = {};

        const MAX_WARN = 3;
        const results = [];

        for (const target of targets) {
            const key = normalize(target);
            db[from][key] = (db[from][key] || 0) + 1;
            const count = db[from][key];

            if (count >= MAX_WARN) {
                // Max warnings reached → kick
                try {
                    await sock.groupParticipantsUpdate(from, [target], 'remove');
                    results.push(`🚫 @${key} ko ${MAX_WARN} warnings ke baad kick kar diya gaya.`);
                    delete db[from][key];
                } catch (e) {
                    results.push(`⚠️ @${key} ko warn mila (${count}/${MAX_WARN}) lekin kick fail: ${e.message}`);
                }
            } else {
                results.push(`⚠️ @${key} ko warn mila (${count}/${MAX_WARN})`);
            }
        }

        saveWarnings(db);

        await sock.sendMessage(from, {
            text:
                `📋 *Warning Update*\n\n` +
                results.join('\n') +
                `\n\n> 𝐖𝐚𝐫𝐧𝐞𝐝 𝐁𝐲 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`,
            mentions: targets
        }, { quoted: msg });

    } catch (error) {
        await sock.sendMessage(from, {
            text: '❌ Warn Error: ' + error.message
        }, { quoted: msg });
    }
};