const input = document.getElementById("cnpjInput");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const toast = document.getElementById("toast");
const apiBtn = document.getElementById("apiBtn");

const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* UTIL */

function randomChar() {
  return chars[Math.floor(Math.random() * chars.length)];
}

function charToValue(char) {
  return char.charCodeAt(0) - 48;
}

/* DV CALC */

function calculateDigit(base, weights) {
  let sum = 0;

  for (let i = 0; i < weights.length; i++) {
    sum += charToValue(base[i]) * weights[i];
  }

  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
}

/* GENERATION */

function generateBase() {
  let base = "";

  for (let i = 0; i < 12; i++) {
    base += randomChar();
  }

  return base;
}

function generateCNPJ() {
  const base = generateBase();

  const w1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];

  const d1 = calculateDigit(base, w1);
  const d2 = calculateDigit(base + d1, w2);

  return base + d1 + d2;
}

/* FORMAT */

function formatCNPJ(cnpj) {
  return (
    cnpj.substring(0,2) + "." +
    cnpj.substring(2,5) + "." +
    cnpj.substring(5,8) + "/" +
    cnpj.substring(8,12) + "-" +
    cnpj.substring(12)
  );
}

/* DISPLAY */

function generateAndShow() {
  const cnpj = generateCNPJ();
  input.value = formatCNPJ(cnpj);
}

/* TOAST */

function showToast(msg) {
  toast.innerText = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1500);
}

/* EVENTS */

generateBtn.addEventListener("click", generateAndShow);

copyBtn.addEventListener("click", () => {
  if (!input.value) return;

  navigator.clipboard.writeText(input.value);
  showToast("CNPJ copiado!");
});

// apiBtn.addEventListener("click", () => {
//   alert("API para Empresas: Em desenvolvimento.");
// });

/* INIT */

generateAndShow();

/* --- MODAL & API FORM (Adicione ao final, substituindo o alert antigo) --- */

const modal = document.getElementById("modalApi");
const closeModalBtn = document.querySelector(".close-modal");
const apiForm = document.getElementById("apiForm");
const formStatus = document.getElementById("form-status");

// 1. Abrir Modal (Substitui o alert)
apiBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

// 2. Fechar Modal (X)
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
  formStatus.innerText = ""; // Limpa mensagens antigas
});

// 3. Fechar clicando fora
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    formStatus.innerText = "";
  }
});

// 4. Envio do Formulário (AJAX para o Formspree)
apiForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Impede recarregar a página
  
  const btn = apiForm.querySelector("button");
  const originalText = btn.innerText;
  
  // Estado de "Enviando"
  btn.innerText = "Enviando...";
  btn.disabled = true;
  formStatus.innerText = "";

  const data = new FormData(event.target);

  try {
    const response = await fetch(event.target.action, {
      method: apiForm.method,
      body: data,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      formStatus.innerText = "✅ Sucesso! Avisaremos você.";
      formStatus.style.color = "#059669"; // Verde
      apiForm.reset();
      
      // Fecha o modal automaticamente após 2 seg
      setTimeout(() => {
        modal.style.display = "none";
        formStatus.innerText = "";
        btn.innerText = originalText;
        btn.disabled = false;
      }, 2000);
      
    } else {
      const errorData = await response.json();
      formStatus.innerText = "❌ Erro. Verifique o e-mail.";
      formStatus.style.color = "#dc2626"; // Vermelho
      btn.innerText = originalText;
      btn.disabled = false;
    }
  } catch (error) {
    formStatus.innerText = "❌ Erro de conexão.";
    formStatus.style.color = "#dc2626";
    btn.innerText = originalText;
    btn.disabled = false;
  }
});
