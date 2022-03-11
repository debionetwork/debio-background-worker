export const isHex = (s: string) => {
  const regexHex = /^(0x|0X)?[a-fA-F0-9]+$/g;
  return regexHex.test(s);
};

export const hexToUtf8 = (s: string) => {
  const hex = s.slice(2);

  return decodeURIComponent(
    hex.replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&'),
  );
};
