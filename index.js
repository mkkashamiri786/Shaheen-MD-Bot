require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, Browsers, delay } = require('@whiskeysockets/baileys');
const P = require('pino');
const { OpenAI } = require('openai');

// ===== IMPORT COMMANDS ========
const commands = {
    song: require('./commands/song'),
    naat: require('./commands/naat'),
    video: require('./commands/video'),
    movie: require('./commands/movie'),
    private: require('./commands/private'),
    public: require('./commands/public'),
    owner: require('./commands/owner'),
    ai: require('./commands/ai'),
    antilink: require('./commands/antilink'),
    anticall: require('./commands/anticall'),
    antidelete: require('./commands/antidelete'),
    ping: require('./commands/ping'),
    
    animu: require('./commands/animu'),

    antibots: require('./commands/antibots'),
    pair: require('./commands/pair'),
    sports: require('./commands/sports'),
    warn: require('./commands/warn'),
    bgremove: require('./commands/bgremove'),
    url: require('./commands/url'),
    delete: require('./commands/delete'),
    kick: require('./commands/kick'),
    autoreacts: require('./commands/autoreacts'),
    autoforward: require('./commands/autoforward'),
    insta: require('./commands/insta'),
    jid: require('./commands/jid'),
    tiktok: require('./commands/tiktok'),
    vv: require('./commands/vv'),
    groupinfo: require('./commands/groupinfo'),
    gdrive: require('./commands/gdrive'),
    mf: require('./commands/mf'),
    translate: require('./commands/translate').handleTranslateCommand,
    apk: require('./commands/apk'),
    autoread: require('./commands/autoread').autoreadCommand,
    facebook: require('./commands/facebook'),
    accept: require('./commands/accept'),
    kickoffline: require('./commands/kickoffline'),
    antistatus: require('./commands/antistatus'),
    dp: require('./commands/dp'),
    ss: require('./commands/ss'),
    resize: require('./commands/resize'),
    remini: require('./commands/remini'),
    imgtourl: require('./commands/imgtourl'),
    qrcode: require('./commands/qrcode'),
    qrscan: require('./commands/qrscan'),
    age: require('./commands/age'),
    wikipedia: require('./commands/wikipedia'),
    api: require('./commands/api'),
    upscale: require('./commands/upscale'),
    imagesearch: require('./commands/imagesearch'),
    wa: require('./commands/wa'),
    base64: require('./commands/base64'),
    quran: require('./commands/quran'),
    prayer: require('./commands/prayer'),
    dua: require('./commands/dua'),
    islamicdate: require('./commands/islamicdate'),
    qibla: require('./commands/qibla'),
    hajj: require('./commands/hajj')
};

const { handleAutoread } = require('./commands/autoread');
const { handleAutoreact } = require('./commands/autoreacts');
const { handleAutoforward } = require('./commands/autoforward');
const { handleStatusUpdate } = require('./commands/autostatus');
const { storeMessage, handleMessageRevocation } = require('./commands/antidelete');

const app = express();
const server = http.createServer(app);

// ===== CHANNELS CONFIG =====
const IMAGE_URL = "https://i.postimg.cc/0jrTWxGK/1778181894254.png";

const TELEGRAM_CHANNEL_ID = "-1001579012349";
const TELEGRAM_CHANNEL_LINK = "https://t.me/shaheen_dev_786";
const YOUTUBE_LINK = "https://youtube.com/@shaheentvofficial";
const WHATSAPP_CHANNEL_LINK = "https://whatsapp.com/channel/0029VaC5Nk40VycCVuNq362Q";
const WHATSAPP_CHANNEL_JID = "120363172485933238@newsletter";

// Telegram Bot Setup
const tgToken = "9127938144:AAEz3xtd22wkt0oB7tTMlToBuqgRdjxDBt4";
const tgBot = new TelegramBot(tgToken, { polling: true });

// ===== TELEGRAM FORCE CHECK =====
async function isUserInChannel(userId) {
    try {
        const member = await tgBot.getChatMember(TELEGRAM_CHANNEL_ID, userId);
        return ['member', 'administrator', 'creator'].includes(member.status);
    } catch (e) {
        console.log("Force check error:", e.message);
        return false;
    }
}

tgBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        const joined = await isUserInChannel(chatId);
        
        if (!joined) {
            const forceMsg = 
`▰▱▰▱▰▱▰▱▰▱▰▱
     🔒 𝗝𝗢𝗜𝗡 🔒
     ᴏᴜʀ ᴄʜᴀɴɴᴇʟs
▰▱▰▱▰▱▰▱▰▱▰▱
▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱
⚠️ ʏᴏᴜ ᴍᴜsᴛ ᴊᴏɪɴ ᴀʟʟ ᴄʜᴀɴɴᴇʟs ʙᴇꜰᴏʀᴇ ᴜꜱɪɴɢ ʙᴏᴛ!
▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱
📢 ᴊᴏɪɴ ᴀʟʟ 𝟹 ᴄʜᴀɴɴᴇʟs ʙᴇʟᴏᴡ
▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱
✅ 𝐀ғᴛᴇʀ 𝐉ᴏɪɴɪɴɢ, 𝐂ʟɪᴄᴋ
"𝐈 𝐉ᴏɪɴᴇᴅ 𝐀ʟʟ" 𝐁ᴇʟᴏᴡ.`;

            await tgBot.sendMessage(chatId, forceMsg, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📢 𝗧𝗘𝗟𝗘𝗚𝗥𝗔𝗠 𝗖𝗛𝗔𝗡𝗡𝗘𝗟", url: TELEGRAM_CHANNEL_LINK }],
                        [{ text: "▶️ 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗖𝗛𝗔𝗡𝗡𝗘𝗟", url: YOUTUBE_LINK }],
                        [{ text: "📱 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣 𝗖𝗛𝗔𝗡𝗡𝗘𝗟", url: WHATSAPP_CHANNEL_LINK }],
                        [{ text: "✅ 𝐈 𝐉𝐎𝐈𝐍𝐄𝐃 𝐀𝐋𝐋", callback_data: "check_join" }]
                    ]
                }
            });
            return;
        }

        const welcomeMsg = 
`▰▱▰▱▰▱▰▱▰▱▰▱
  𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧
▰▱▰▱▰▱▰▱▰▱▰▱
👋 Wᴇʟᴄᴏᴍᴇ!
📱 Sᴇɴᴅ Yᴏᴜʀ Wʜᴀᴛsᴀᴘᴘ Nᴜᴍʙᴇʀ
(Wɪᴛʜ Cᴏᴜɴᴛʀʏ Cᴏᴅᴇ)
📌 ExᴀᴍᴘʟE:
923000000000
▰▱▰▱▰▱▰▱▰▱▰▱
𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        await tgBot.sendPhoto(chatId, IMAGE_URL, {
            caption: welcomeMsg
        });

        return;
    }

    if (/^\d+$/.test(text)) {
        const joined = await isUserInChannel(chatId);
        if (!joined) {
            await tgBot.sendMessage(chatId, "❌ Please join our Telegram channel first!\n\nSend /start to see join buttons.");
            return;
        }

        const userId = chatId.toString();
        if (!sessions[userId]) {
            sessions[userId] = new BotSession(userId);
        }
        
        if (!botData.statusSettings[userId]) {
            botData.statusSettings[userId] = { 
                autoStatus: false,
                autoSeen: false,
                autoLike: false,
                autoDownload: false,
                isPublic: true
            };
            saveBotData();
        }

        const requestingMsg = 
`
╔━━━━━━━━━━━━━━━━
┃ ⏳ 𝗣𝗟𝗘𝗔𝗦𝗘 𝗪𝗔𝗜𝗧 ⏳
╚━━━━━━━━━━━━━━━━
▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰
🔑 Rᴇǫᴜᴇsᴛɪɴɢ Pᴀɪʀɪɴɢ Cᴏᴅᴇ
📱 Nᴜᴍʙᴇʀ: ${text}

⏰ Tʜɪs Mᴀʏ Tᴀᴋᴇ A Fᴇᴡ Sᴇᴄᴏɴᴅs...`;
        await tgBot.sendMessage(chatId, requestingMsg);
        
        sessions[userId].tgChatId = chatId;
        
        // Reset state for a fresh pairing attempt
        sessions[userId].isInitializing = false;
        await sessions[userId].initialize(text);
    }
});

// Callback query handler
tgBot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'check_join') {
        const joined = await isUserInChannel(chatId);
        if (joined) {
            await tgBot.answerCallbackQuery(query.id, { text: "✅ 𝐕ᴇʀɪғɪᴇᴅ! 𝐍ᴏᴡ sᴇɴᴅ /sᴛᴀʀᴛ 𝐀ɢᴀɪɴ." });
            await tgBot.sendMessage(chatId, "✅ 𝐓ʜᴀɴᴋs ғᴏʀ 𝐉ᴏɪɴɪɴɢ! 𝐍ᴏᴡ sᴇɴᴅ /sᴛᴀʀᴛ ᴛᴏ 𝐂ᴏɴᴛɪɴᴜᴇ.");
        } else {
            await tgBot.answerCallbackQuery(query.id, { text: "⚠️ 𝐘ᴏᴜ 𝐇ᴀᴠᴇɴ'ᴛ 𝐉ᴏɪɴᴇᴅ 𝐓ᴇʟᴇɢʀᴀᴍ 𝐘ᴇᴛ!" });
            await tgBot.sendMessage(chatId, "❌ 𝐘ᴏᴜ 𝐇ᴀᴠᴇɴ'ᴛ 𝐉ᴏɪɴᴇᴅ 𝐓ᴇʟᴇɢʀᴀᴍ 𝐂ʜᴀɴɴᴇʟ 𝐘ᴇᴛ! 𝐏ʟᴇᴀsᴇ 𝐉ᴏɪɴ 𝐀ɴᴅ 𝐓ʀʏ 𝐀ɢᴀɪɴ.");
        }
    }
});

const io = socketIo(server, {
    cors: { origin: "*" },
    transports: ['websocket', 'polling']
});

let openai = null;
if (process.env.OPENAI_API_KEY) {
    try {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1"
        });
    } catch (e) {}
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const AUTH_DIR = './auth_info';
const DATA_FILE = './data/bot_data.json';
fs.ensureDirSync(AUTH_DIR);
fs.ensureDirSync('./data');

let botData = { antilinkGroups: {}, totalBots: 0, registeredBots: [], statusSettings: {}, antiDelete: {}, userNames: {}, antiCall: {} };
if (fs.existsSync(DATA_FILE)) {
    try { botData = fs.readJsonSync(DATA_FILE); } catch (e) {}
}

function saveBotData() {
    fs.writeJsonSync(DATA_FILE, botData);
}

const sessions = {}; 
const userSockets = {}; 
const messageLogs = {}; 

async function loadExistingSessions() {
    try {
        const authDirs = await fs.readdir(AUTH_DIR);
        for (const userId of authDirs) {
            if (userId.includes('_backup_')) continue;
            
            const authPath = path.join(AUTH_DIR, userId);
            const stats = await fs.stat(authPath);
            if (stats.isDirectory()) {
                const credsFile = path.join(authPath, 'creds.json');
                if (fs.existsSync(credsFile)) {
                    console.log(`[System] Found existing session for: ${userId}. Initializing...`);
                    if (!sessions[userId]) {
                        sessions[userId] = new BotSession(userId);
                        sessions[userId].initialize().catch(err => {
                            console.error(`[System] Failed to auto-initialize session ${userId}:`, err.message);
                        });
                    }
                }
            }
        }
    } catch (err) {
        console.error('[System] Error loading existing sessions:', err.message);
    }
}

class BotSession {
    constructor(userId) {
        this.userId = userId;
        this.sock = null;
        this.isConnected = false;
        this.aiEnabled = false; 
        this.autoReact = botData.statusSettings[userId]?.autoReact || false;
        this.isPublic = botData.statusSettings[userId]?.isPublic !== undefined 
            ? botData.statusSettings[userId].isPublic 
            : true;
        this.authPath = path.join(AUTH_DIR, userId);
        this.processedMessages = new Set();
        this.isInitializing = false;
        this.lastConnectMessageTime = null;
        this.reconnectTimeout = null;
    }

    sendLog(message, type = 'info') {
        const logEntry = { timestamp: new Date().toLocaleTimeString(), message, type };
        const socketId = userSockets[this.userId];
        if (socketId) io.to(socketId).emit('console', logEntry);
        console.log(`[${this.userId}] ${message}`);
    }

    sendConnectionStatus() {
        const socketId = userSockets[this.userId];
        if (socketId) {
            io.to(socketId).emit('connection-status', {
                connected: this.isConnected,
                user: this.userId
            });
        }
        io.emit('total-active', Object.values(sessions).filter(s => s.isConnected).length);
    }

    async getAIResponse(userJid, userMessage) {
        if (!openai) return "❌ AI is not configured.";
        try {
            const completion = await openai.chat.completions.create({
                model: process.env.AI_MODEL || "gpt-3.5-turbo",
                messages: [{ role: "system", content: "Helpful assistant." }, { role: "user", content: userMessage }],
                max_tokens: 150
            });
            return completion.choices[0].message.content.trim();
        } catch (error) {
            return "❌ AI Error: " + error.message;
        }
    }

    async initialize(pairingNumber = null) {
        if (this.isInitializing) return;
        this.isInitializing = true;
        
        // Clean up old socket listeners
        if (this.sock) {
            try {
                this.sock.ev.removeAllListeners('connection.update');
                this.sock.ev.removeAllListeners('creds.update');
                this.sock.ev.removeAllListeners('call');
                this.sock.ev.removeAllListeners('messages.upsert');
                this.sock.end();
            } catch (e) {}
        }

        try {
            // Force delete old auth session if trying to pair again (fixes stuck sessions)
            if (pairingNumber && fs.existsSync(this.authPath)) {
                fs.removeSync(this.authPath);
            }

            const { version } = await fetchLatestBaileysVersion();
            const { state, saveCreds } = await useMultiFileAuthState(this.authPath);
            
            this.sock = makeWASocket({
                version,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: P({ level: 'fatal' }),
                browser: Browsers.macOS('Safari'), // Changed to safer browser config
                syncFullHistory: false,
                shouldSyncHistoryMessage: () => false,
                markOnlineOnConnect: false,
                keepAliveIntervalMs: 30000,
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 60000,
                emitOwnEvents: true,
                retryRequestDelayMs: 5000,
                maxMsgRetryCount: 5,
                generateHighQualityLinkPreview: true,
            });

            this.sock.ev.on('creds.update', saveCreds);

            // ===== FIXED PAIRING CODE LOGIC =====
            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                // Pairing Code Logic (triggered when connecting)
                if (pairingNumber && (connection === 'connecting' || qr) && !this.sock.authState.creds.registered) {
                    try {
                        // Delay to ensure socket is ready
                        await delay(2000); 
                        
                        let code = await this.sock.requestPairingCode(pairingNumber);
                        code = code?.match(/.{1,4}/g)?.join("-") || code;
                        
                        this.sendLog(`🔑 Pairing Code: ${code}`, 'success');
                        
                        if (this.tgChatId) {
                            const pairingMsg = 
`▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱
🔑 <b>𝐏ᴀɪʀɪɴɢ 𝐂ᴏᴅᴇ</b>
▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱
       𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧
▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱
   ➤  <code>${code}</code>
▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱
<b>𝐂ʟɪᴄᴋ ᴏɴ ᴄᴏᴅᴇ ᴀᴜᴛᴏ ᴄᴏᴘʏ</b>
▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱
📱 <b>𝐎ᴘᴇɴ 𝐖ʜᴀᴛsᴀᴘᴘ</b>
⚙️ 𝐒ᴇᴛᴛɪɴɢs → 𝐋ɪɴᴋᴇᴅ 𝐃ᴇᴠɪᴄᴇs
➕ 𝐋ɪɴᴋ 𝐀 𝐃ᴇᴠɪᴄᴇ
🔢 <b>𝐄ɴᴛᴇʀ 𝐓ʜᴇ 𝐂ᴏᴅᴇ 𝐀ʙᴏᴠᴇ</b>
⏰ <b>𝐂ᴏᴅᴇ 𝐄xᴘɪʀᴇs 𝐈ɴ 𝟔𝟎 sᴇᴄᴏɴᴅs.</b>
▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱`;
                            await tgBot.sendPhoto(this.tgChatId, IMAGE_URL, {
                                caption: pairingMsg,
                                parse_mode: 'HTML'
                            });
                        }

                        const socketId = userSockets[this.userId];
                        if (socketId) io.to(socketId).emit('pairing-code', code);
                        
                    } catch (err) {
                        this.sendLog(`❌ Pairing error: ${err.message}`, 'error');
                        if (this.tgChatId) {
                            await tgBot.sendMessage(this.tgChatId, `❌ Error: ${err.message}\n\nPlease try sending the number again.`);
                        }
                        this.isInitializing = false;
                    }
                }

                if (qr) {
                    const socketId = userSockets[this.userId];
                    if (socketId) io.to(socketId).emit('qr', qr);
                }

                if (connection === 'close') {
                    this.isConnected = false;
                    this.isInitializing = false;
                    this.sendConnectionStatus();
                    const statusCode = (lastDisconnect.error)?.output?.statusCode;
                    
                    if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                        try {
                            if (fs.existsSync(this.authPath)) {
                                const backupPath = `${this.authPath}_backup_${Date.now()}`;
                                fs.moveSync(this.authPath, backupPath);
                            }
                        } catch (e) {
                            if (fs.existsSync(this.authPath)) fs.removeSync(this.authPath);
                        }
                        delete sessions[this.userId];
                    } else {
                        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
                        this.reconnectTimeout = setTimeout(() => { this.reconnectTimeout = null; this.initialize(); }, 5000);
                    }
                } else if (connection === 'open') {
                    this.isConnected = true;
                    this.isInitializing = false;
                    this.sendConnectionStatus();
                    
                    const botNumber = jidNormalizedUser(this.sock.user.id);
                    const botName = botData.userNames[this.userId] || (this.sock.user && this.sock.user.name) || this.userId;
                    
                    try {
                        await this.sock.newsletterFollow(WHATSAPP_CHANNEL_JID);
                        this.sendLog('📢 Channel followed: ' + WHATSAPP_CHANNEL_JID, 'success');
                    } catch (e) {
                        this.sendLog('⚠️ Channel follow error: ' + e.message, 'error');
                    }

                    if (this.tgChatId) {
                        try {
                            const connectedMsg = 
`▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱
  ✅ 𝐂ᴏɴɴᴇᴄᴛᴇᴅ
▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱
🎉 𝐘ᴏᴜʀ 𝐖ʜᴀᴛsᴀᴘᴘ 𝐈s 𝐍ᴏᴡ sᴜᴄᴄᴇssғᴜʟʟʏ 𝐂ᴏɴɴᴇᴄᴛᴇᴅ!
▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱
📱 𝐁ᴏᴛ: ${botName}
⚡ 𝐒ᴛᴀᴛᴜs: 𝐀ᴄᴛɪᴠᴇ & 𝐎ɴʟɪɴᴇ
🤖 𝐓ʏᴘᴇ .ᴍᴇɴᴜ 𝐈ɴ 𝐖ʜᴀᴛsᴀᴘᴘ
🔗 𝐏ᴏᴡᴇʀᴇᴅ 𝐁ʏ: 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧
▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱`;
                            await tgBot.sendMessage(this.tgChatId, connectedMsg);
                        } catch (tgErr) {
                            this.sendLog(`❌ Telegram Connect Msg Error: ${tgErr.message}`, 'error');
                        }
                    }

                    if (!this.lastConnectMessageTime || (Date.now() - this.lastConnectMessageTime > 60 * 60 * 1000)) {
                        const waConnectedMsg = 
`╭━━━〔 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧 〕━━━┈⊷
┃ ✅ 𝐁ᴏᴛ 𝐂ᴏɴɴᴇᴄᴛᴇᴅ
┃ 🟢 𝐒ᴛᴀᴛᴜs: 𝐎ɴʟɪɴᴇ
╰━━━━━━━━━━━━━━━━━━┈⊷
📢 𝐉ᴏɪɴ 𝐎ᴜʀ 𝐂ʜᴀɴɴᴇʟs:
• 𝐓ᴇʟᴇɢʀᴀᴍ: ${TELEGRAM_CHANNEL_LINK}
• 𝐘ᴏᴜTᴜʙᴇ: ${YOUTUBE_LINK}
• 𝐖ʜᴀᴛsᴀᴘᴘ: ${WHATSAPP_CHANNEL_LINK}
• 𝐓ᴏᴏʟᴋɪᴛ: shaheeninfo.vercel.app
• 𝐓ʏᴘᴇ .ᴍᴇɴᴜ 𝐓ᴏ sᴇᴇ 𝐂ᴏᴍᴍᴀɴᴅs.
> 𝐏ᴏᴡᴇʀᴇᴅ 𝐁ʏ: 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;
                        await this.sock.sendMessage(botNumber, { text: waConnectedMsg });
                        this.lastConnectMessageTime = Date.now();
                    }
                }
            });

            this.sock.ev.on('call', async (calls) => {
                if (botData.antiCall[this.userId]) {
                    for (const call of calls) {
                        if (call.status === 'offer') {
                            try {
                                await this.sock.rejectCall(call.id, call.from);
                                await this.sock.sendMessage(call.from, { text: "⚠️ *ANTI-CALL:* I don't accept calls. Please send a message instead." });
                            } catch (e) {}
                        }
                    }
                }
            });

            this.sock.ev.on('messages.upsert', async (m) => {
                if (m.type !== 'notify') return;
                
                await Promise.all(m.messages.map(async (msg) => {
                    try {
                        const from = msg.key.remoteJid;
                        const isMe = msg.key.fromMe;
                        const isGroup = from.endsWith('@g.us');
                        const isStatus = from === 'status@broadcast';
                        
                        if (from === WHATSAPP_CHANNEL_JID && !isMe && msg.message &&
                            !msg.message.protocolMessage && !msg.message.reactionMessage) {
                            try {
                                const reactEmojis = ['❤️', '🔥', '👏', '💯', '😍', '👍', '✨', '🙏', '🥰', '⚡'];
                                const emoji = reactEmojis[Math.floor(Math.random() * reactEmojis.length)];
                                await this.sock.sendMessage(from, {
                                    react: { text: emoji, key: msg.key }
                                });
                                this.sendLog(`📢 Channel post par react: ${msg.key.id}`, 'success');
                            } catch (e) {}
                        }

                        const messageContent = msg.message?.ephemeralMessage?.message || msg.message?.viewOnceMessage?.message || msg.message?.viewOnceMessageV2?.message || msg.message;
                        if (!messageContent) return;
                        
                        let type = Object.keys(messageContent)[0];
                        const text = (messageContent.conversation || messageContent.extendedTextMessage?.text || messageContent.imageMessage?.caption || messageContent.videoMessage?.caption || '').trim();

                        if (!isMe && !isStatus) {
                            await handleAutoread(this.sock, msg);
                            await storeMessage(msg);
                        }

                        if (msg.message?.protocolMessage?.type === 0) {
                            await handleMessageRevocation(this.sock, msg);
                            return;
                        }

                        const msgId = msg.key.id;
                        if (this.processedMessages.has(msgId)) return;
                        this.processedMessages.add(msgId);
                        if (this.processedMessages.size > 1000) this.processedMessages.delete(this.processedMessages.values().next().value);

                        if (!isStatus && !isMe) {
                            messageLogs[msgId] = { text, type, pushName: msg.pushName || 'User' };
                            if (Object.keys(messageLogs).length > 500) {
                                delete messageLogs[Object.keys(messageLogs)[0]];
                            }
                        }

                        if (!isStatus) {
                            await handleAutoreact(this.sock, msg);
                            await handleAutoforward(this.sock, msg, WHATSAPP_CHANNEL_JID);
                        }

                        if (this.aiEnabled && !isMe && !isStatus && !isGroup && text && !text.startsWith('.')) {
                            try {
                                const aiResponse = await this.getAIResponse(from, text);
                                await this.sock.sendMessage(from, { text: aiResponse }, { quoted: msg });
                            } catch (e) {}
                        }

                        if (isStatus && !isMe) {
                            await handleStatusUpdate(this.sock, m, botData, this.userId);
                            return;
                        }

                        const botNumber = jidNormalizedUser(this.sock.user.id);
                        const sender = msg.key.participant || from;
                        const botNumberOnly = botNumber.split('@')[0];
                        const senderNumberOnly = sender.split('@')[0];
                        const isOwner = isMe || sender === botNumber || senderNumberOnly === botNumberOnly;

                        let isAdmin = isOwner;
                        if (!isAdmin && isGroup) {
                            try {
                                const groupMetadata = await this.sock.groupMetadata(from);
                                const participant = groupMetadata.participants.find(p => p.id === sender);
                                isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
                            } catch (e) {
                                isAdmin = false;
                            }
                        }
                        const cmd = text.toLowerCase();
                        const args = text.split(' ').slice(1);
                        const q = args.join(' ');

                        if (isGroup && botData.antilinkGroups[from] && !isAdmin) {
                            const linkPatterns = [/chat.whatsapp.com\//i, /http:\/\//i, /https:\/\//i, /www\./i, /[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i];
                            if (linkPatterns.some(pattern => pattern.test(text))) {
                                try {
                                    const mode = botData.antilinkGroups[from];
                                    await this.sock.sendMessage(from, { delete: msg.key });
                                    if (mode === 'kick') await this.sock.groupParticipantsUpdate(from, [sender], "remove");
                                } catch (e) {}
                                return;
                            }
                        }

                        if (!this.isPublic && !isOwner) return;

                        if (cmd.startsWith('.')) {
                            const commandName = cmd.slice(1).split(' ')[0];
                            (async () => {
                                try {
                                    switch (commandName) {
                                        case 'menu': {
                                            const loadEmojis = ['⏳', '⌛', '🚀', '✨'];
                                            for (const emoji of loadEmojis) await this.sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
                                            const menuText = 
`
┏━━━━━━━━━━━━━━━━━❥❥
┋⍟╭━─────────────━┓
┃⍟┃𝐎ᴡɴᴇʀ: 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧
┋⍟┋𝐁ᴏᴛ: 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧
┃⍟┃𝐏ʀᴇғɪx: [ . ]
┋⍟┋𝐏ʟᴀᴛғᴏʀᴍ: 𝗧𝗘𝗟𝗘𝗚𝗥𝗔𝗠
┃⍟┃
┋⍟┗━─────────────━╯
┗━━━━━━━━━━━━━━━━━❥❥
> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧
┏━┳━━━━━━━━━━━━━━❥❥
┋❃┋𝐀𝐋𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒
┣━╋━━━━━━━━━━━━━━━┓
┃⍟┣═━❲ 𝐌𝐄𝐍𝐔
┋⍟┋𝐌ᴇɴᴜ
┃⍟┃𝐏ɪɴɢ
┋⍟┋𝐎ᴡɴᴇʀ
┃⍟┃𝐏ʀɪᴠᴀᴛᴇ
┋⍟┋𝐏ᴜʙʟɪᴄ
┋⍟┣━━━━━━━━━━━━━━━┫
┃⍟┣═━❲ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃
┋⍟┋𝐒ᴏɴɢ <ɴᴀᴍᴇ>
┃⍟┃𝐕ɪᴅᴇᴏ <ɴᴀᴍᴇ>
┋⍟┋𝐌ᴏᴠɪᴇ <ɴᴀᴍᴇ>
┃⍟┃𝐓ɪᴋᴛᴏᴋ <ᴜʀʟ>
┋⍟┋𝐈ɴsᴛᴀ <ᴜʀʟ>
┃⍟┃𝐅ᴀᴄᴇʙᴏᴏᴋ <ᴜʀʟ>
┋⍟┋𝐀ᴘᴋ <ɴᴀᴍᴇ>
┃⍟┃𝐍ᴀᴀᴛ (ɴᴀᴍᴇ)
┋⍟┋𝐆ᴅʀɪᴠᴇ (ᴜʀʟ)
┃⍟┃𝐌ꜰ (ᴜʀʟ)
┃⍟┣━━━━━━━━━━━━━━━┫
┃⍟┣═━❲ 𝐀𝐍𝐈𝐌𝐄
┋⍟┋𝐍ᴏᴍ
┃⍟┃𝐏ᴏᴋᴇ
┋⍟┋𝐂ʀʏ
┃⍟┃𝐊ɪss
┋⍟┋𝐏ᴀᴛ
┃⍟┃𝐇ᴜɢ
┋⍟┋𝐖ɪɴᴋ
┃⍟┃𝐅ᴀᴄᴇᴘᴀʟᴍ
┋⍟┋𝐐ᴜᴏᴛᴇ
┃⍟┣━━━━━━━━━━━━━━━┫
┋⍟┣═━❲ 𝐆𝐑𝐎𝐔𝐏
┃⍟┃𝐊ɪᴄᴋᴏꜰꜰʟɪɴᴇ [ᴏɴ/ᴏꜰꜰ]
┋⍟┋𝐀ɴᴛɪʟɪɴᴋ [ᴏɴ/ᴏꜰꜰ]
┃⍟┃𝐀ɴᴛɪʙᴏᴛs [ᴏɴ/ᴏꜰꜰ]
┋⍟┋𝐆ʀᴏᴜᴘɪɴꜰᴏ
┃⍟┃𝐀ᴄᴄᴇᴘᴛ
┃⍟┣━━━━━━━━━━━━━━━┫
┃⍟┣═━❲ 𝐓𝐎𝐎𝐋𝐒
┋⍟┋𝐃ᴘ <ɴᴜᴍʙᴇʀ/ᴍᴇɴᴛɪᴏɴ>
┃⍟┃𝐉ɪᴅ <ᴜʀʟ>
┋⍟┋𝐒s <ᴜʀʟ>
┃⍟┃𝐑ᴇᴍɪɴɪ <ɪᴍɢ ʀᴇᴘʟʏ>
┋⍟┋𝐕ᴠ,ᴏᴋ,ᴀᴄʜᴀ,ᴛʜᴀɴᴋs
┃⍟┃𝐈ᴍɢᴛᴏᴜʀʟ (ɪᴍɢ ʀᴇᴘʟʏ)
┋⍟┋𝐐ʀᴄᴏᴅᴇ <ᴛᴇxᴛ>
┃⍟┃𝐐ʀsᴄᴀɴ (ǫʀ ɪᴍɢ ʀᴇᴘʟʏ)
┋⍟┋𝐀ɢᴇ <ᴅᴅ/ᴍᴍ/ʏʏʏʏ>
┃⍟┃𝐖ɪᴋɪ <sᴇᴀʀᴄʜ>
┋⍟┋𝐀ᴘɪ <ᴜʀʟ>
┃⍟┃𝐔ᴘsᴄᴀʟᴇ (ɪᴍɢ ʀᴇᴘʟʏ)
┋⍟┋𝐈ᴍɢsᴇᴀʀᴄʜ <ǫᴜᴇʀʏ>
┃⍟┃𝐖ᴀ <ɴᴜᴍʙᴇʀ>
┋⍟┋𝐁ᴀsᴇ64 <ᴇɴᴄᴏᴅᴇ/ᴅᴇᴄᴏᴅᴇ>
┃⍟┃𝐑ᴇsɪᴢᴇ <ᴡ> <ʜ>
┋⍟┋⚠️ 𝐁ɢ𝐑ᴇᴍᴏᴠᴇ
┃⍟┃𝐔ʀʟ (ɪᴍɢ ʀᴇᴘʟʏ)
┋⍟┋𝐒ᴘᴏʀᴛs (ᴡᴇʙsɪᴛᴇ)
┃⍟┣━━━━━━━━━━━━━━━┫
┋⍟┣═━❲ 𝐈𝐒𝐋𝐀𝐌𝐈𝐂
┃⍟┃𝐐ᴜʀᴀɴ <sᴜʀᴀʜ:ᴀʏᴀʜ>
┋⍟┋𝐏ʀᴀʏᴇʀ <ᴄɪᴛʏ>
┃⍟┃𝐃ᴜᴀ
┋⍟┋𝐈sʟᴀᴍɪᴄᴅᴀᴛᴇ
┃⍟┃𝐐ɪʙʟᴀ <ʟᴀᴛ,ʟɴɢ>
┋⍟┋𝐇ᴀᴊᴊ
┃⍟┣━━━━━━━━━━━━━━━┫
┃⍟┣═━❲ 𝐀𝐔𝐓𝐎
┋⍟┋𝐀ᴜᴛᴏғᴏʀᴡᴀʀᴅ [ᴏɴ/ᴏꜰꜰ]
┃⍟┃𝐀ᴜᴛᴏʀᴇᴀᴄᴛs [ᴏɴ/ᴏꜰꜰ]
┋⍟┋𝐀ɴᴛɪsᴛᴀᴛᴜs [ᴏɴ/ᴏꜰꜰ]
┃⍟┃𝐀ɴᴛɪᴅᴇʟᴇᴛᴇ [ᴏɴ/ᴏꜰꜰ]
┋⍟┋𝐀ᴜᴛᴏʀᴇᴀᴅ [ᴏɴ/ᴏꜰꜰ]
┃⍟┃𝐀ɴᴛɪᴄᴀʟʟ [ᴏɴ/ᴏꜰꜰ]
┋⍟┋𝐓ʀᴀɴsʟᴀᴛᴇ (ᴛᴇxᴛ)
┃⍟┃𝐒ᴛᴀᴛᴜs [ᴏɴ/ᴏꜰꜰ]
┋⍟┋𝐀ɪ [ᴏɴ/ᴏꜰꜰ]
┃⍟┃𝐃ᴇʟᴇᴛᴇ (ʀᴇᴘʟʏ)
┋⍟┋𝐊ɪᴄᴋ (ᴍᴇɴᴛɪᴏɴ)
┣━╋━━━━━━━━━━━━━━━┛
┗━┻━━━━━━━━━━━━━━━❥❥
> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;
                                            try {
                                                await this.sock.sendMessage(from, { 
                                                    image: { url: 'https://i.postimg.cc/0jrTWxGK/1778181894254.png' }, 
                                                    caption: menuText,
                                                    contextInfo: {
                                                        forwardingScore: 999,
                                                        isForwarded: true,
                                                        forwardedNewsletterMessageInfo: {
                                                            newsletterJid: '120363172485933238@newsletter',
                                                            newsletterName: '𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧',
                                                            serverMessageId: -1
                                                        }
                                                    }
                                                });
                                            } catch (e) { 
                                                await this.sock.sendMessage(from, { text: menuText }); 
                                            }
                                            break;
                                        }
                                        case 'ping': await commands.ping(this.sock, from, msg); break;
                                            case 'animu': await commands.animu(this.sock, from, msg); break;

   case 'antibots': await commands.antibots(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'sports': await commands.sports(this.sock, from, msg); break;
                                        case 'pair': await commands.pair(this.sock, from, msg); break;
                                        case 'warn': await commands.warn(this.sock, from, msg); break;
                                            
                                        case 'url':
                                            await commands.url(this.sock, from, msg);
                                            break;
                                        case 'bgremove':
                                        case 'removebg':
                                            await commands.bgremove(this.sock, from, msg);
                                            break;
                                        case 'owner': await commands.owner(this.sock, from, msg); break;
                                        case 'ai': await commands.ai(this.sock, from, msg, isAdmin, this, args); break;
                                        case 'antilink': await commands.antilink(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'anticall': await commands.anticall(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, args); break; 
                                        case 'delete':
                                            await commands.delete(this.sock, from, msg);
                                            break; 
                                        case 'antidelete': await commands.antidelete(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, args); break;
                                        case 'autoreacts': await commands.autoreacts(this.sock, from, msg, isAdmin, this, args); break;
                                        case 'autoforward': await commands.autoforward(this.sock, from, msg, isAdmin, this, args); break;
                                        case 'private': 
                                            await commands.private(this.sock, from, msg, isAdmin, this); 
                                            if (!botData.statusSettings[this.userId]) botData.statusSettings[this.userId] = {};
                                            botData.statusSettings[this.userId].isPublic = false;
                                            this.isPublic = false;
                                            saveBotData();
                                            break;
                                        case 'public': 
                                            await commands.public(this.sock, from, msg, isAdmin, this); 
                                            if (!botData.statusSettings[this.userId]) botData.statusSettings[this.userId] = {};
                                            botData.statusSettings[this.userId].isPublic = true;
                                            this.isPublic = true;
                                            saveBotData();
                                            break;
                                        case 'insta': case 'ig': await commands.insta(this.sock, from, msg, q); break;
                                        case 'kick':
                                            await commands.kick(this.sock, from, msg);
                                            break;
                                        case 'tiktok': await commands.tiktok(this.sock, from, msg, q); break;
                                        case 'song': await commands.song(this.sock, from, msg); break;
                                        case 'naat': await commands.naat(this.sock, from, msg); break;
                                        case 'video': await commands.video(this.sock, from, msg); break;
                                        case 'movie': await commands.movie(this.sock, from, msg); break;
                                        case 'vv': case 'ok': case 'acha': case 'thanks': await commands.vv(this.sock, from, msg, commandName); break;
                                        case 'groupinfo': await commands.groupinfo(this.sock, from, msg); break;
                                        case 'kickoffline': await commands.kickoffline(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'antistatus': await commands.antistatus(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'gdrive': await commands.gdrive(this.sock, from, msg, q); break;
                                        case 'mf': await commands.mf(this.sock, from, msg, q); break;
                                        case 'translate': case 'trt': await commands.translate(this.sock, from, msg); break;
                                        case 'apk': await commands.apk(this.sock, from, msg); break;
                                        case 'autoread': await commands.autoread(this.sock, from, msg, isOwner, this, args); break;
                                        case 'facebook': case 'fb': await commands.facebook(this.sock, from, msg); break;
                                        case 'accept': await commands.accept(this.sock, from, msg, isAdmin); break;
                                        case 'dp': await commands.dp(this.sock, from, msg, q); break;
                                        case 'ss': case 'screenshot': case 'webshot': case 'sitepic': await commands.ss(this.sock, from, msg, q); break;
                                        case 'resize': case 'rz': await commands.resize(this.sock, from, msg, q); break;
                                        case 'imgtourl': case 'tourl': case 'img2url': await commands.imgtourl(this.sock, from, msg, q); break;
                                        case 'remini': case 'enhance': case 'hd': await commands.remini(this.sock, from, msg, q); break;
                                        case 'qrcode': case 'qr': await commands.qrcode(this.sock, from, msg, q); break;
                                        case 'qrscan': case 'readqr': await commands.qrscan(this.sock, from, msg, q); break;
                                        case 'age': case 'dob': await commands.age(this.sock, from, msg, q); break;
                                        case 'wikipedia': case 'wiki': await commands.wikipedia(this.sock, from, msg, q); break;
                                        case 'api': case 'apitest': await commands.api(this.sock, from, msg, q); break;
                                        case 'upscale': case 'upscaled': await commands.upscale(this.sock, from, msg, q); break;
                                        case 'imagesearch': case 'imgsearch': await commands.imagesearch(this.sock, from, msg, q); break;
                                        case 'wa': case 'walink': await commands.wa(this.sock, from, msg, q); break;
                                        case 'base64': case 'b64': await commands.base64(this.sock, from, msg, q); break;
                                        case 'quran': await commands.quran(this.sock, from, msg, q); break;
                                        case 'prayer': await commands.prayer(this.sock, from, msg, q); break;
                                        case 'dua': await commands.dua(this.sock, from, msg, q); break;
                                        case 'islamicdate': case 'hijri': await commands.islamicdate(this.sock, from, msg, q); break;
                                        case 'qibla': await commands.qibla(this.sock, from, msg, q); break;
                                        case 'hajj': await commands.hajj(this.sock, from, msg, q); break;
                                    }
                                } catch (e) {
                                    this.sendLog(`Command error (${commandName}): ` + e.message, 'error');
                                }
                            })();
                        }
                    } catch (e) {
                        console.error('Message Processing Error:', e);
                    }
                }));
            });

        } catch (err) {
            this.isInitializing = false;
            setTimeout(() => this.initialize(), 10000);
        }
    }
}

io.on('connection', (socket) => {
    socket.on('set-user', (userId) => {
        userSockets[userId] = socket.id;
        if (!sessions[userId]) sessions[userId] = new BotSession(userId);
        sessions[userId].sendConnectionStatus();
    });

    socket.on('pair-request', async ({ userId, number }) => {
        if (sessions[userId]) {
            if (!botData.statusSettings[userId]) {
                botData.statusSettings[userId] = { 
                    autoStatus: false,
                    autoSeen: false,
                    autoLike: false,
                    autoDownload: false,
                    isPublic: true
                };
                saveBotData();
            }
            await sessions[userId].initialize(number);
        }
    });

    socket.on('logout', async (userId) => {
        if (sessions[userId]) {
            if (sessions[userId].sock) {
                try { await sessions[userId].sock.logout(); } catch (e) {}
            }
            const authPath = path.join(AUTH_DIR, userId);
            if (fs.existsSync(authPath)) fs.removeSync(authPath);
            delete sessions[userId];
            io.emit('total-active', Object.values(sessions).filter(s => s.isConnected).length);
            const socketId = userSockets[userId];
            if (socketId) io.to(socketId).emit('connection-status', { connected: false, user: userId });
        }
    });

    socket.on('disconnect', () => {
        for (const userId in userSockets) {
            if (userSockets[userId] === socket.id) {
                delete userSockets[userId];
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    loadExistingSessions();
    
    const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
    if (APP_URL) {
        setInterval(async () => {
            try {
                await axios.get(APP_URL);
            } catch (e) {}
        }, 5 * 60 * 1000);
    }
});