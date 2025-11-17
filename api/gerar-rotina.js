// Este é o código do seu "Escritório Seguro" (Vercel)
const { Groq } = require('groq-sdk');

// Inicializa o cliente da Fábrica (Groq)
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY, 
});

// Esta é a função que espera o "Atendente" (Z.ai) chegar com o pedido
export default async function handler(req, res) {

    // 1. Libera o seu site Z.ai para falar com este escritório
    // (Sem isso, o navegador bloqueia por segurança - o "Erro de CORS")
    res.setHeader('Access-Control-Allow-Origin', '*'); // '*' libera qualquer um. 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. Responde a uma checagem de segurança do navegador
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Se não for o método certo (POST), rejeita
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Apenas POST é permitido' });
    }

    // 4. Pega os dados do quiz que o Atendente (Z.ai) enviou
    const dadosDoQuiz = req.body;

    // 5. O "Prompt Mágico": sua instrução para o especialista da Fábrica
    const prompt = `
        Você é um tricologista especialista.
        Um cliente respondeu o seguinte quiz:
        ${JSON.stringify(dadosDoQuiz)}

        Com base nisso, gere uma rotina de cuidados e diagnóstico.
        Formate a resposta em HTML (use <h3> para títulos e <ul>/<li> para listas).
    `;

    // 6. O Gerente (Vercel) faz a ligação privada para a Fábrica (Groq)
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama3-8b-8192',
        });

        const respostaDaIA = chatCompletion.choices[0]?.message?.content;

        // 7. O Gerente devolve a resposta pronta para o Atendente (Z.ai)
        res.status(200).json({ rotinaGerada: respostaDaIA });

    } catch (error) {
        // Se a Fábrica der erro, avisa o Atendente
        console.error('ERRO AO CHAMAR GROQ:', error);
        res.status(500).json({ message: 'Erro ao contatar a IA.' });
    }
}
