import { useState } from 'react';
import './App.css';

const API_KEY = "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";

function App() {
  const [question, setQuestion] = useState("");
  const [reponse, setReponse] = useState([]);

  const APIBody = {
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "system", "content": "Tu dois donner 5 catégories de réponse concises différentes et possible à la phrase donnée du plus au moins d'accord sur une échelle de 1 à 5."},
      {"role": "user", "content": question}
    ]
  };

  const handleButtonClick = (selectedResponse) => {
    setReponse([selectedResponse]);
  };

  async function callOpenAIAPI(){
    console.log("Calling the OpenAI API");
    try {
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
    }
  }

  return (
    <div className="App">
      <div>
        <textarea
          onChange={(e) => setQuestion(e.target.value)}
          placeholder='Votre question'
          cols={75}
          rows={3}
        />
      </div>
      <div className="button-container">
        <button onClick={callOpenAIAPI}>Générer des réponses</button>
        {
          reponse.length > 0 ? (
            <div>
              {reponse.map((suggestion, index) => (
                <button key={index} onClick={() => handleButtonClick(suggestion)}>{suggestion}</button>
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
