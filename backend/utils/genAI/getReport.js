function getReport(prompt, ai) {
  return ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt
  });
}