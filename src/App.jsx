import { useEffect, useState } from 'react';
import './App.css';

const API_KEY = "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"; // Changer la clé (sécurité)

function App() {
  const [question, setQuestion] = useState("");
  const [reponse, setReponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakResponse, setSpeakResponse] = useState(true);

  const APIBody = {
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "system", "content": "Tu dois donner 5 catégories de réponse concises différentes et possible à la phrase donnée du plus au moins d'accord sur une échelle de 1 à 5. Si ce n'est pas adapté, fais des propositions. N'indique pas le numéro de réponse ni la catégorie."},
      {"role": "user", "content": question}
    ]
  };

  const handleButtonClick = (selectedResponse) => {
    setReponse([selectedResponse]);
    if (speakResponse) {
      speak(selectedResponse);
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const recognition = new window.webkitSpeechRecognition(); // for WebKit browsers
    recognition.lang = 'fr-FR';

    recognition.onstart = () => {
      setListening(true);
    };
    console.log("Audio Transcription begins")

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Transcript:", transcript);
      setQuestion(transcript);
      recognition.stop();
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    console.log("Audio Transcription ends")
  };

  async function callOpenAIAPI(){
    console.log("Calling the OpenAI API");
    try {
      setLoading(true);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(APIBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        const suggestions = data.choices[0].message.content.split('\n');
        setReponse(suggestions.filter(suggestion => suggestion.trim() !== ''));
      } else {
        console.error("Invalid response format from OpenAI API");
      }
    } catch (error) {
      console.error("Error during API call:", error);
    } finally {
      setLoading(false); // Désactiver l'état de chargement, peu importe le résultat
    }
  }

  useEffect(() => {
    if (listening) {
      startListening();
    }
  }, [listening]);

  return (
    <div className="App">
      <header>
        <h1>Interface de communication</h1>
      </header>
      <div className='speech-button'>
          <button onClick={startListening}>
            <i className="fas fa-microphone"></i> Commencer l'écoute
          </button>
          <button onClick={stopListening}>
            <i className="fas fa-stop"></i> Arrêter l'écoute
          </button>
        </div>
      <div>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder='Votre question'
          cols={75}
          rows={3}
        />
      </div>
      <div className="button-container">
        <button onClick={callOpenAIAPI}>
          <i className="fas fa-cogs"></i> Générer des réponses
          </button>
          {loading && <div className="loading-indicator">Chargement en cours...</div>}
        {
          reponse.length > 0 ? (
            <div>
              {reponse.map((suggestion, index) => (
                <button key={index} onClick={() => handleButtonClick(suggestion)}>
                  {suggestion}
                  </button>
              ))}
            </div>
          ) : null
        }
        {
          reponse.length > 0 && (
            <div style={{ textAlign: 'center' }}>
              <h3>Réponse choisie : {reponse[0]}</h3>
            </div>
          )
        }
      </div>
    </div>
  );
}

export default App;
