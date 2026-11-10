const axios = require('axios');

async function duaCommand(sock, from, msg, q) {
    try {
        // 🎬 Loading reactions
        const loadEmojis = ['🤲', '✨', '🌙'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        // ✅ Random Dua from free API
        const res = await axios.get('https://api.quran.com/api/v4/chapters', { timeout: 30000 });
        // Fallback: Use static duas if API fails
        
        const duas = [
            {
                arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أُمَّسِينَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
                transliteration: 'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilaykal-masir.',
                english: 'O Allah! With Your power we have come to the morning, with Your power we come to the evening, with Your power we live, and we die, and to You we will return.',
                reference: 'Abu Dawud, Adab, 110'
            },
            {
                arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ',
                transliteration: 'Allahumma inni a\'udhu bika minal hammi wal hazani',
                english: 'O Allah, I take refuge in You from anxiety and sorrow.',
                reference: 'Abu Dawud, Salat, 367'
            },
            {
                arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
                transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina \'adhaban-nar',
                english: 'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.',
                reference: 'Quran 2:201'
            },
            {
                arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
                transliteration: 'Allahumma a\'inni \'ala dhikrika wa shukrika wa husni \'ibadatik',
                english: 'O Allah, help me to remember You, to thank You, and to worship You in the best manner.',
                reference: 'Abu Dawud, Witr, 26'
            },
            {
                arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
                transliteration: 'Rabbish-rah li sadri wa yassir li amri',
                english: 'My Lord, expand for me my breast [with assurance] and ease for me my task.',
                reference: 'Quran 20:25-26'
            }
        ];

        const randomDua = duas[Math.floor(Math.random() * duas.length)];

        const caption = 
`╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆🤲 𝐃𝐔𝐀
╰━━━━━━━━━━━━━━━━⊷

━━━━━━━━━━━━━━━━━━━━━━
*𝐀𝐑𝐀𝐁𝐈𝐂:*
${randomDua.arabic}

━━━━━━━━━━━━━━━━━━━━━━
*𝐓𝐑𝐀𝐍𝐒𝐋𝐈𝐓𝐄𝐑𝐀𝐓𝐈𝐎𝐍:*
${randomDua.transliteration}

━━━━━━━━━━━━━━━━━━━━━━
*𝐄𝐍𝐆𝐋𝐈𝐒𝐇:*
${randomDua.english}

━━━━━━━━━━━━━━━━━━━━━━
📖 *𝐑𝐄𝐅𝐄𝐑𝐄𝐍𝐂𝐄:* ${randomDua.reference}

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        await sock.sendMessage(from, { text: caption }, { quoted: msg });

    } catch (e) {
        console.log('Dua Error:', e.message);
        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗜𝗦𝗟𝗔𝗠𝗜𝗖 𖤝︎𓆪
┆❌ 𝐄𝐑𝐑𝐎𝐑
╰━━━━━━━━━━━━━━━━⊷

⚠️ Dua load nahi ho saki.
┆Dobara try karein.

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`
        }, { quoted: msg });
    }
}

module.exports = duaCommand;