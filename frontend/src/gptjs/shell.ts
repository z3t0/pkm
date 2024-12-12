import { OllamaClient } from "./gpt.ts";


const ollama_client = new OllamaClient();

ollama_client.healthCheck();

async function ask(question: string) {
  const answer =
    await ollama_client.generateCompletion(question)

  console.log("Question: " + question,
    "Answer: " + answer)
}

ask("How many provinces are in canada?")

