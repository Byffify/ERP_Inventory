const digits = [
  "",
  "หนึ่ง",
  "สอง",
  "สาม",
  "สี่",
  "ห้า",
  "หก",
  "เจ็ด",
  "แปด",
  "เก้า",
];
function words(n: number): string {
  if (n >= 1000000) {
    const rest = n % 1000000;
    return words(Math.floor(n / 1000000)) + "ล้าน" + (rest ? words(rest) : "");
  }
  const text = String(n);
  const places = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const digit = Number(text[i]),
      place = text.length - i - 1;
    if (!digit) continue;
    if (place === 1) {
      result +=
        (digit === 1 ? "" : digit === 2 ? "ยี่" : digits[digit]) + "สิบ";
    } else if (place === 0 && digit === 1 && text.length > 1) {
      result += "เอ็ด";
    } else result += digits[digit] + places[place];
  }
  return result || "ศูนย์";
}
export function bahtWords(satang: number) {
  if (!Number.isSafeInteger(satang) || satang < 0)
    throw new Error("ยอดเงินไม่ถูกต้อง");
  const decimal = satang % 100;
  return (
    words(Math.floor(satang / 100)) +
    "บาท" +
    (decimal ? words(decimal) + "สตางค์" : "ถ้วน")
  );
}
