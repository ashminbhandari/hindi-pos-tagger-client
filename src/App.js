import React, { useState } from 'react';
import './App.css';

function App() {
  const [currentSentence, setCurrentSentence] = useState('');
  const [sentencePosPairs, setSentencePosPairs] = useState([]);

  const handleGenerateTags = async () => {
    try {
      const response = await fetch('pos_tagger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sentence: currentSentence.replace(/\s+/g, ' ').trim() })
      });
      const data = await response.json();
      console.log(data);
      setSentencePosPairs([...sentencePosPairs, { sentence: data.sentence, posTags: data.result }]);
      setCurrentSentence('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="card">
      <h2>Hindi POS Tagger</h2>
      <div style={{ marginBottom: '10px' }}>
        {sentencePosPairs.map((pair, index) => (
          <div key={index}>
            <span>{pair.sentence}</span>
            <span> --&gt; {pair.posTags}</span>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: '100%' }}>
        <input
          type="text"
          style={{ width: '100%', height: '40px', border: '1px solid black', fontSize: '24px' }}
          value={currentSentence}
          onChange={(e) => setCurrentSentence(e.target.value)}
        />
      </div>
      <div className="button-group">
        <button onClick={handleGenerateTags}>Generate tags</button>
      </div>
    </div>
  );
}

export default App;
