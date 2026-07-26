/**
 * Pure TypeScript utility to generate static Pix codes (Pix Copia e Cola)
 * base on EMV Co / Banco Central do Brasil specifications.
 */

function sanitizeString(str: string, maxLength: number): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-zA-Z0-9\s]/g, "") // Keep alphanumeric & space
    .toUpperCase()
    .trim()
    .substring(0, maxLength);
}

function formatLength(value: string): string {
  return value.length.toString().padStart(2, "0");
}

function valueOf(id: string, value: string): string {
  return `${id}${formatLength(value)}${value}`;
}

function calculateCRC16(payload: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;
  const bytes = new TextEncoder().encode(payload);

  for (const byte of bytes) {
    crc ^= (byte << 8);
    for (let i = 0; i < 8; i++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

interface GeneratePixParams {
  key: string;       // Pix key (phone, email, CPF/CNPJ, EVP)
  amount: number;    // Amount, e.g. 5.00
  name: string;      // Recipient name, max 25 chars
  city: string;      // Recipient city, max 15 chars
}

export function generatePixCode({ key, amount, name, city }: GeneratePixParams): string {
  const cleanKey = key.trim();
  const cleanName = sanitizeString(name || "BENEFICIARIO", 25);
  const cleanCity = sanitizeString(city || "SAO PAULO", 15);
  const cleanAmount = amount.toFixed(2);

  const payloadFormat = valueOf("00", "01"); // format ID = "01"
  
  // Merchant Account Information (ID 26)
  const gui = valueOf("00", "br.gov.bcb.pix");
  const keyField = valueOf("01", cleanKey);
  const merchantAccountInfo = valueOf("26", `${gui}${keyField}`);

  const merchantCategoryCode = valueOf("52", "0000");
  const transactionCurrency = valueOf("53", "986"); // 986 = BRL
  const transactionAmount = valueOf("54", cleanAmount);
  const countryCode = valueOf("58", "BR");
  const merchantName = valueOf("59", cleanName);
  const merchantCity = valueOf("60", cleanCity);
  
  // Additional Data (ID 62) -> TxID (ID 05): "***" is standard for static tags
  const txid = valueOf("05", "***");
  const additionalData = valueOf("62", txid);

  // Partial string before checksum
  const incompletePayload = 
    payloadFormat +
    merchantAccountInfo +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmount +
    countryCode +
    merchantName +
    merchantCity +
    additionalData +
    "6304"; // ID 63, length 04

  const checksum = calculateCRC16(incompletePayload);
  return `${incompletePayload}${checksum}`;
}
