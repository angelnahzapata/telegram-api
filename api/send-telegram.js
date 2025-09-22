// api/send-telegram.js
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Solo se permite método POST'
        });
    }

    console.log('=== INICIO TELEGRAM REQUEST ===');
    
    try {
        // Tu token y chat ID (reemplaza estos valores)
        const CONFIG = {
            BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '7849775375:AAEhax_EGayAU0xEztdymwWN1RnizErSnKk',
            CHAT_ID: process.env.TELEGRAM_CHAT_ID || '-1002887383983',
            API_URL: 'https://api.telegram.org/bot'
        };

        const { message, orderData } = req.body;

        // Validar que llegue el mensaje
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Falta parámetro: message es requerido'
            });
        }

        // URL de Telegram API
        const telegramUrl = `${CONFIG.API_URL}${CONFIG.BOT_TOKEN}/sendMessage`;
        
        // Payload para Telegram
        const payload = {
            chat_id: CONFIG.CHAT_ID,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        };

        console.log('=== ENVIANDO A TELEGRAM ===');
        console.log('Chat ID:', CONFIG.CHAT_ID);
        console.log('Mensaje length:', message.length);

        // Petición a Telegram API
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const telegramResult = await response.json();

        if (response.ok && telegramResult.ok) {
            console.log('✅ Mensaje enviado exitosamente a Telegram');
            
            return res.status(200).json({
                success: true,
                messageId: telegramResult.result.message_id,
                chatId: telegramResult.result.chat.id
            });
        } else {
            console.error('❌ Error de Telegram:', telegramResult);
            return res.status(400).json({
                success: false,
                error: telegramResult.description || 'Error de Telegram API',
                errorCode: telegramResult.error_code
            });
        }

    } catch (error) {
        console.error('❌ Error general:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message
        });
    }
}