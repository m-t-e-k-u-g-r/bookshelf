export function removeWhiteSpace(text: string) {
  return text.replace(/ /g, '');
}

export function removeHyphen(text: string) {
  return text.replace(/-/g, '');
}

export function formatDateYYYY_MM_DD(date: Date = new Date()) {
  const pad = (num: number) => num.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}_${month}_${day}`;
}
