import { customAlphabet } from "nanoid";

const uuidAlphabet = customAlphabet("0123456789abcdef", 32);

export const uuid = () => {
  const id = uuidAlphabet();
  return (
    id.slice(0, 8) +
    "-" +
    id.slice(8, 12) +
    "-" +
    "4" + // Version 4
    id.slice(13, 16) +
    "-" +
    // First character of this group must be 8, 9, a, or b for version 4 UUID
    ((parseInt(id.slice(16, 17), 16) & 0x3) | 0x8).toString(16) +
    id.slice(17, 20) +
    "-" +
    id.slice(20)
  );
};
