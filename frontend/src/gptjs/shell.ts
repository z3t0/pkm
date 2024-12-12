import { OllamaClient } from "./gpt.ts";


const ollama_client = new OllamaClient();

ollama_client.healthCheck();

async function ask(question: string) {
  const answer =
    await ollama_client.generateCompletion(question)

  console.log("Question: " + question, '\n',
    "Answer: " + answer)
}

async function askWithContext(context: string, question: string) {

  const prompt = `Given the following context: "` +
    context + `.

==================

Answer the following question: "`+
question

  const answer = await ask(prompt);
}

ask("How many provinces are in canada?")
askWithContext("It is december", "How many days are in the current month?")

