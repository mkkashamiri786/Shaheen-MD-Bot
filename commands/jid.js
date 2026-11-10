module.exports = async (sock, from, msg, args) => {
    try {
        let targetJid = from;
        let extractionType = "Current Chat Context";

        // 🎬 Loading reactions
        const loadEmojis = ['🔍', '📡', '🎯'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }

        // 1. Argument check (Link or Number)
        if (args && args.length > 0) {
            const input = args[0].trim();

            // Case A: WhatsApp Channel / Newsletter Link
            if (input.includes('whatsapp.com/channel/')) {
                const inviteCode = input.split('whatsapp.com/channel/')[1]?.split('/')[0]?.split('?')[1] || 
                                   input.split('whatsapp.com/channel/')[1]?.split('/')[0];

                if (inviteCode) {
                    try {
                        const res = await sock.newsletterMetadata("invite", inviteCode);
                        if (res && res.id) {
                            targetJid = res.id;
                            extractionType = "WhatsApp Newsletter [Channel Link]";
                        } else {
                            return await sock.sendMessage(from, { 
                                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆❌ 𝐄𝐗𝐓𝐑𝐀𝐂𝐓𝐈𝐎𝐍 𝐅𝐀𝐈𝐋𝐄𝐃
╰━━━━━━━━━━━━━━━━⊷

⚠️ Unable to resolve metadata
┆from this channel link.

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧` 
                            }, { quoted: msg });
                        }
                    } catch (err) {
                        return await sock.sendMessage(from, { 
                            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆❌ 𝐀𝐏𝐈 𝐄𝐑𝐑𝐎𝐑
╰━━━━━━━━━━━━━━━━⊷

⚠️ Failed to ping newsletter server.
┆Ensure the channel link is valid.

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧` 
                        }, { quoted: msg });
                    }
                }
            }
            // Case A2: WhatsApp Group invite link
            else if (input.includes('chat.whatsapp.com/')) {
                const inviteCode = input.split('chat.whatsapp.com/')[1]?.split('/')[0]?.split('?')[0];

                if (inviteCode) {
                    try {
                        const res = await sock.groupInviteInfo(inviteCode);
                        if (res && res.id) {
                            targetJid = res.id;
                            extractionType = "WhatsApp Group [Invite Link]";
                        } else {
                            return await sock.sendMessage(from, { 
                                text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆❌ 𝐄𝐗𝐓𝐑𝐀𝐂𝐓𝐈𝐎𝐍 𝐅𝐀𝐈𝐋𝐄𝐃
╰━━━━━━━━━━━━━━━━⊷

⚠️ Unable to resolve group metadata.

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧` 
                            }, { quoted: msg });
                        }
                    } catch (err) {
                        return await sock.sendMessage(from, { 
                            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆❌ 𝐀𝐏𝐈 𝐄𝐑𝐑𝐎𝐑
╰━━━━━━━━━━━━━━━━⊷

⚠️ Failed to resolve group invite.
┆Link may be invalid or expired.

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧` 
                        }, { quoted: msg });
                    }
                }
            }
            // Case B: Direct Phone Number
            else {
                let cleanNumber = input.replace(/[^0-9]/g, '');
                if (cleanNumber.length >= 10) {
                    targetJid = cleanNumber + '@s.whatsapp.net';
                    extractionType = "Direct Phone Number";
                }
            }
        }
        // 2. Mentioned user
        else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            extractionType = "Mention Tag";
        }
        // 3. Replied message user
        else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            targetJid = msg.message.extendedTextMessage.contextInfo.participant;
            extractionType = "Reply Message";
        }
        // 4. Current chat context

        // 📡 Stylish Output
        let jidPayload = 
`╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆📡 𝐉𝐈𝐃 𝐓𝐑𝐀𝐂𝐊𝐄𝐑
╰━━━━━━━━━━━━━━━━⊷

🤖 *𝐁𝐎𝐓:* 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧
⚙️ *𝐌𝐎𝐃𝐔𝐋𝐄:* Packet Sniffer
🔍 *𝐒𝐎𝐔𝐑𝐂𝐄:* ${extractionType}

╭━━━━━━━━━━━━━━━━⊷
┆🔑 *𝐑𝐄𝐒𝐎𝐋𝐕𝐄𝐃 𝐉𝐈𝐃*
╰━━━━━━━━━━━━━━━━⊷

\`\`\`${targetJid}\`\`\`

╭━━━━━━━━━━━━━━━━⊷
┆✅ 𝐄𝐗𝐓𝐑𝐀𝐂𝐓𝐈𝐎𝐍
┆   𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘
╰━━━━━━━━━━━━━━━━⊷
> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧`;

        await sock.sendMessage(from, { text: jidPayload }, { quoted: msg });

    } catch (e) {
        console.error("Error in JID command:", e);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
        await sock.sendMessage(from, { 
            text: `╭━━━━━━━━━━━━━━━━⊷
├━𓊈𓆩𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧𖤝︎𓆪
┆❌ 𝐊𝐄𝐑𝐍𝐄𝐋 𝐅𝐀𝐔𝐋𝐓
╰━━━━━━━━━━━━━━━━⊷

⚠️ Failed to execute
┆JID tracking routine.

> ©𝐏𝙾𝚆𝙴𝚁𝙳 𝐁𝚈 𝗦𝗛𝗔𝗛𝗘𝗘𝗡-𝗠𝗗-𝗕𝗢𝗧` 
        }, { quoted: msg });
    }
};