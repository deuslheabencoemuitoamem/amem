import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, Copy, Smartphone, CreditCard } from "lucide-react";
import { generatePixCode } from "../lib/pix";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

interface CheckoutViewProps {
  onBack: () => void;
}

export default function CheckoutView({ onBack }: CheckoutViewProps) {
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Default Pix vendor parameters
  const pixKey = "lucasdelimapraxedes@gmail.com";
  const recipientName = "Lucas Apolônio Praxedes de Lima";
  const recipientCity = "SAO PAULO";
  const productPrice = 15.0;

  useEffect(() => {
    // Scroll to top when checkout opens
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (paymentMethod === "pix") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 
        event: 'gerou_pix',
        forma_pagamento: 'pix',
        valor: productPrice
      });
    }
  }, [paymentMethod]);

  const getWhatsAppUrl = (methodOverride?: "pix" | "card") => {
    const currentMethod = methodOverride || paymentMethod;
    let message = "";
    if (currentMethod === "pix") {
      message += `Olá! Realizei o pagamento de R$ 15,00 via Pix.\n\n`;
      message += `Gostaria de receber a oração completa para realizar todos os meus sonhos. Segue o comprovante!`;
    } else {
      message += `Olá! Gostaria de fazer o pagamento de R$ 15,00 da Oração por Cartão de Crédito. Pode me enviar o link seguro de pagamento?`;
    }

    const encodedText = encodeURIComponent(message);
    return `https://wa.me/5511912032350?text=${encodedText}`;
  };

  const handleCopyPixCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 
      event: 'gerou_pix',
      forma_pagamento: 'pix',
      valor: productPrice
    });
  };

  const handleFinishPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);

    if (paymentMethod === "pix") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 
        event: 'confirmou_pagamento_pix',
        valor: productPrice
      });
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 
        event: 'iniciou_pagamento_cartao_wpp',
        forma_pagamento: 'cartao_credito',
        valor: productPrice
      });
    }

    const url = getWhatsAppUrl();
    try {
      window.open(url, "_blank");
    } catch (err) {
      console.log("Navigation blocked by browser iframe rules, user can click button directly.", err);
    }
  };

  const handleScrollToTop = () => {
    const topElem = document.getElementById("checkout-top");
    if (topElem) {
      topElem.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pixCode = generatePixCode({
    key: pixKey,
    amount: productPrice,
    name: recipientName,
    city: recipientCity,
  });

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-y-auto pb-16 px-4 select-none">
      
      {/* Target for scrolling to top */}
      <div id="checkout-top" className="pt-4" />

      {/* Top Header - Image 7 style */}
      <header className="max-w-md mx-auto pt-2 pb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao vídeo</span>
        </button>
      </header>

      <main className="max-w-md mx-auto space-y-4">

        {/* Testimonial Banner Block */}
        <div className="bg-gradient-to-r from-amber-950/70 via-amber-900/50 to-amber-950/70 border border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5 my-1 text-left">
          <div className="flex items-start gap-3 text-xl sm:text-2xl text-amber-100 font-bold leading-snug">
            <span className="text-emerald-400 font-bold shrink-0 mt-0.5 text-2xl sm:text-3xl">✓</span>
            <p>
              <strong className="text-amber-300 font-bold">Lorena:</strong> “Recebi minha oração completa e estou muito satisfeita!”
            </p>
          </div>
          <div className="border-t border-amber-500/20 pt-3 flex items-start gap-3 text-xl sm:text-2xl text-amber-100 font-bold leading-snug">
            <span className="text-emerald-400 font-bold shrink-0 mt-0.5 text-2xl sm:text-3xl">✓</span>
            <p>
              <strong className="text-amber-300 font-bold">Vinicius:</strong> “Acabei de receber minha oração, estou muito feliz”
            </p>
          </div>
          <div className="border-t border-amber-500/20 pt-3 flex items-start gap-3 text-xl sm:text-2xl text-amber-100 font-bold leading-snug">
            <span className="text-emerald-400 font-bold shrink-0 mt-0.5 text-2xl sm:text-3xl">✓</span>
            <p>
              <strong className="text-amber-300 font-bold">Maria:</strong> “Estou muito feliz, em menos de um minuto recebi minha oração completa!”
            </p>
          </div>
        </div>

        {/* Section 1: Header Text Paragraphs */}
        <div className="text-center space-y-4 py-2">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#fef08a] leading-snug">
            Continue assistindo a Oração para realizar todos os seus sonhos por apenas R$15!
          </h1>
          <p className="text-xl sm:text-2xl font-serif font-bold text-[#fef08a] leading-snug">
            Após você clicar em "Já realizei o pix" ou em "Cartão", você vai ser redirecionado(a) para o meu Whatsapp
          </p>
          <p className="text-xl sm:text-2xl font-serif font-bold text-[#fef08a] leading-snug">
            Ao enviar o comprovante do pagamento, vou te enviar a oração completa para você realizar todos os seus sonhos!
          </p>
        </div>

        {/* Section 2: Payment Component (Image 5 - immediately below text without extra space) */}
        <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
          
          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-[#09090b] p-1.5 rounded-2xl border border-white/5">
            <button
              type="button"
              onClick={() => setPaymentMethod("pix")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${
                paymentMethod === "pix"
                  ? "bg-[#f97316] text-white shadow-lg"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>PIX</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentMethod("card");
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({ 
                  event: 'iniciou_pagamento_cartao_wpp',
                  forma_pagamento: 'cartao_credito'
                });
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${
                paymentMethod === "card"
                  ? "bg-[#f97316] text-white shadow-lg"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>CARTÃO</span>
            </button>
          </div>

          <form onSubmit={handleFinishPayment} className="space-y-4">
            {paymentMethod === "pix" ? (
              <div className="space-y-4 text-center">
                
                {/* QR Code */}
                <div className="w-52 h-52 bg-white rounded-2xl mx-auto flex items-center justify-center p-3 shadow-xl">
                  <img
                    src={qrCodeUrl}
                    alt="Pix QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Amount and Key Box (Favorecido removed as requested in image 3) */}
                <div className="bg-[#09090b] p-3.5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-sm font-bold text-white select-text">
                    Valor a pagar: R$ 15.00
                  </p>
                  <p className="text-xs text-neutral-400 select-text">
                    Chave: {pixKey}
                  </p>
                </div>

                {/* Pix Copia e Cola Field */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-neutral-400 font-semibold">
                    CÓDIGO PIX COPIA E COLA
                  </label>
                  <div className="flex gap-2 items-center bg-[#09090b] border border-white/10 rounded-xl p-2 pl-3">
                    <span className="text-xs font-mono text-neutral-300 truncate flex-grow select-all">
                      {pixCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPixCode(pixCode)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        copied
                          ? "bg-green-500 text-black"
                          : "bg-[#f97316] text-white hover:bg-[#ea580c] active:scale-95"
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? "Copiado!" : "Copiar"}</span>
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1 pt-1">
                  <p className="text-sm font-bold text-white">
                    Escaneie o QR Code ou Copie o Código
                  </p>
                  <p className="text-xs text-neutral-400">
                    O processamento é imediato, seguro e sem taxas no PagBank.
                  </p>
                </div>

                {/* Primary CTA Button */}
                <button
                  type="submit"
                  className="w-full bg-white hover:bg-neutral-100 active:scale-[0.98] text-black font-extrabold text-base py-4 rounded-2xl shadow-xl transition-all uppercase tracking-wider cursor-pointer"
                >
                  JÁ REALIZEI O PIX!
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center py-2">
                <div className="bg-[#09090b] p-4 rounded-2xl border border-white/5 space-y-2">
                  <p className="text-sm font-bold text-white">
                    Valor a pagar: R$ 15.00
                  </p>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Clique no botão abaixo para ser redirecionado(a) ao WhatsApp e solicitar seu link seguro de pagamento por cartão.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#f97316] hover:bg-[#ea580c] active:scale-[0.98] text-white font-extrabold text-base py-4 rounded-2xl shadow-xl transition-all uppercase tracking-wider cursor-pointer"
                >
                  PAGAR COM CARTÃO (R$ 15,00)
                </button>
              </div>
            )}
          </form>

          {/* Success state WhatsApp button fallback */}
          {isSuccess && (
            <div className="mt-4 bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-2xl text-center space-y-3">
              <p className="text-xs text-neutral-200">
                Se o WhatsApp não abriu automaticamente, clique no botão abaixo:
              </p>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-black py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-lg"
              >
                <span>🟢 ABRIR WHATSAPP</span>
              </a>
            </div>
          )}
        </div>

        {/* Section 3: Testimonial Card (Image 6) */}
        <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-7 my-6 text-center shadow-xl">
          <p className="font-serif font-bold text-[#fef08a] text-xl sm:text-2xl leading-snug select-text">
            "Antes de assistir essa oração, eu já estava sem esperança. Tinha tentado de tudo e sentia que meus sonhos estavam cada vez mais distantes. Durante a oração, senti uma paz que fazia muito tempo que eu não experimentava. Passei a enfrentar os desafios com mais fé, mais confiança e mais coragem. Hoje percebo mudanças na minha forma de agir, nas minhas oportunidades e, principalmente, dentro do meu coração. Se você acredita em Deus e está precisando renovar sua esperança, vale muito a pena assistir até o fim."
          </p>
        </div>

        {/* Section 4: CTA Button below Testimonial Card */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleScrollToTop}
            className="w-full bg-[#f97316] hover:bg-[#ea580c] active:scale-[0.98] text-white font-extrabold text-base sm:text-lg py-4 px-6 rounded-2xl shadow-2xl transition-all uppercase tracking-wider border border-orange-400/30 animate-pulse cursor-pointer"
          >
            Quero fazer essa oração também!
          </button>
        </div>

      </main>
    </div>
  );
}
