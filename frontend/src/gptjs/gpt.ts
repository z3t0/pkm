

class OllamaClient {

  serverUrl() {
    return "http://rk-mbp-g3h:11434"
  }

  defaultModel() {
    return "llama3.2"
  }

  async healthCheck() {

    const res = await fetch(this.serverUrl());

    if (!res.ok) {
      console.warn("ollama client health check was NOT ok")
    } else {
      console.log("ollama health check was ok")
    }
  }

  apiUrlGenerateCompletion() {
    return this.serverUrl() + "/api/generate"
  }

  async generateCompletion(userPrompt: string) {
    const streamFalse = false;

    const payload = {
      model: this.defaultModel(),
      prompt: userPrompt,
      stream: streamFalse
    }



    const res = await fetch(this.apiUrlGenerateCompletion(),
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body:
          JSON.stringify(payload)
      })

    const completion = await res.json()

    return completion.response;

  }


}

export { OllamaClient } 