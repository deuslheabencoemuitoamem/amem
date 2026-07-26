import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON bodies parsing
app.use(express.json());

// API Route: Secure PagBank / PagSeguro Credit Card payment endpoint
app.post("/api/pagbank/charge", async (req, res) => {
  try {
    const { 
      cardHolderName, 
      cardNumber, 
      cardExpiry, 
      cardCvv, 
      amount, 
      offers,
      installments = 1
    } = req.body;

    if (!cardHolderName || !cardNumber || !cardExpiry || !cardCvv || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: "Dados de cartão incompletos para processamento." 
      });
    }

    const token = process.env.PAGBANK_API_TOKEN;
    
    // Suporte ultra-resiliente para variáveis com acento ou nomes customizados feitos pelo usuário
    const envVal = (
      process.env.PAGBANK_ENVIRONMENT || 
      process.env.AMBIENTEBANCARIO || 
      process.env.AMBIENTEBANCÁRIO || 
      process.env.AMBIENTE_BANCARIO || 
      "production"
    ).toString().toLowerCase().trim();

    const isProd = envVal === "production" || envVal === "produção" || envVal === "producao" || envVal === "prod";

    // 1. If key is missing, enter Mock Developer Sandbox preview mode with pristine visual UI feedback
    if (!token) {
      console.log("------------------------------------------------------------------");
      console.log("🔒 [PAGBANK PROXY] MODO DE PREVIEW DE CHECKOUT SEM SUA CHAVE:");
      console.log(`Portador: ${cardHolderName}`);
      console.log(`Cartão: ${cardNumber.substring(0, 4)} **** **** ${cardNumber.slice(-4)}`);
      console.log(`Valor: R$ ${Number(amount).toFixed(2)}`);
      console.log(`Parcelas: ${installments}x`);
      console.log("Nota: Insira PAGBANK_API_TOKEN no seu painel de Secrets para processar de verdade.");
      console.log("------------------------------------------------------------------");

      // Artificial small bank delay to give a authentic look
      await new Promise(resolve => setTimeout(resolve, 2000));
      return res.status(200).json({
        success: true,
        mode: "simulated",
        message: "Simulação de transação aprovada com sucesso! Sem chave salva.",
        transactionId: "SIM-" + Math.floor(Math.random() * 10000000)
      });
    }

    // 2. Real Integration with PagSeguro / PagBank API V4 (Checkout Transparente)
    console.log(`💳 [PAGBANK PROXY] Iniciando cobrança real de R$ ${amount}...`);

    // Clean formatting
    const rawCardNumber = cardNumber.replace(/\s+/g, "");
    const [expMonth, expYear] = cardExpiry.split("/");
    const fullExpYear = expYear?.length === 2 ? `20${expYear}` : expYear;
    const valueInCents = Math.round(Number(amount) * 100); // PagBank expects integer cents (BRL)

    // Select endpoint
    const url = isProd 
      ? "https://api.pagseguro.com/charges" 
      : "https://sandbox.api.pagseguro.com/charges";

    // Format secure payload for PagBank API V4 
    const payload = {
      reference_id: "PED-" + Math.floor(Math.random() * 10000000),
      description: `Pedido Deus Te Ama - ${offers || 'Video e Bônus'}`,
      amount: {
        value: valueInCents,
        currency: "BRL"
      },
      payment_method: {
        type: "CREDIT_CARD",
        installments: Number(installments),
        capture: true,
        card: {
          number: rawCardNumber,
          exp_month: expMonth,
          exp_year: fullExpYear,
          security_code: cardCvv,
          holder: {
            name: cardHolderName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
          }
        }
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json() as any;

    if (!response.ok) {
      console.error("❌ [PAGBANK PROXY] Erro na resposta da API PagBank:", data);
      
      // Parse detailed error message from PagBank API V4
      let displayMessage = "Transação recusada pela operadora ou dados do cartão inválidos.";
      if (data.error_messages && data.error_messages.length > 0) {
        displayMessage = data.error_messages.map((e: any) => e.description).join(" | ");
      }

      return res.status(400).json({
        success: false,
        message: displayMessage
      });
    }

    console.log("✅ [PAGBANK PROXY] Cobrança aprovada! ID da transação:", data.id);
    return res.status(200).json({
      success: true,
      mode: "live",
      transactionId: data.id,
      status: data.status,
      message: "Pagamento aprovado com sucesso direto na sua conta PagBank!"
    });

  } catch (error: any) {
    console.error("🔥 [PAGBANK PROXY] Erro no servidor durante cobrança:", error);
    return res.status(500).json({
      success: false,
      message: "Falha interna no processamento. Verifique sua chave de acesso e tente novamente."
    });
  }
});

// Vite middleware for rendering assets and compiling front-end in live preview iframe
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OK] Servidor rodando na porta ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Erro ao inicializar o servidor de desenvolvimento:", err);
});
