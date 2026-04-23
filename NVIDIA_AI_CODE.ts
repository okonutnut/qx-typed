import OpenAI from "openai";

const openai = new OpenAI({
  apiKey:
    "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",
  baseURL: "https://integrate.api.nvidia.com/v1",
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "deepseek-ai/deepseek-v3.2",
    messages: [{ role: "user", content: "" }],
    temperature: 1,
    top_p: 0.95,
    max_tokens: 8192,
    chat_template_kwargs: { thinking: true },
    stream: true,
  });

  for await (const chunk of completion) {
    const reasoning = chunk.choices[0]?.delta?.reasoning_content;
    if (reasoning) process.stdout.write(reasoning);
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
}

main();
