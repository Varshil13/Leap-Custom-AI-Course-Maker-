export const extractJsonArray = (str) => {
  if (!str) throw new Error("Empty AI response");
  // strip code fences if present
  const cleaned = str.replace(/```json|```/g, "");
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON array found in response");
  return JSON.parse(match[0]);
};