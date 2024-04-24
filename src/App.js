import React, { useState, useEffect } from "react";
import "./App.css";

const tagToMeaning = {
  NN: "Noun",
  NNP: "Proper Noun",
  JJ: "Adjective",
  DEM: "Determiner / Demonstrative",
  INJ: "Interjection",
  INTF: "Adverb (Intensifier)",
  NEG: "Negation",
  NST: "Spatial Nouns",
  RP: "Particles",
  PRP: "Pronoun",
  RB: "Adverb",
  RDP: "Reduplications",
  AF: "Quantifiers",
  VAUX: "Auxiliary Verb",
  SYM: "Symbol",
  PSP: "Postposition",
  CC: "Coordination Conjunction",
  QC: "Cardinals",
  QO: "Ordinals",
};

function DisplayResults({ refreshDisplay }) {
  const [sentences, setSentences] = useState([]);
  const [results, setResults] = useState([]);
  const [edit, setEdit] = useState({});
  const [editSavedResponse, setEditSavedResonse] = useState({});
  const [tagVotes, setTagVotes] = useState({});

  useEffect(() => {
    // Fetch data from the API when the component mounts
    fetch("http://127.0.0.1:5000/get_sentences")
      .then((response) => response.json())
      .then((data) => {
        // Update state with the fetched data
        setSentences(data.sentences);
        setResults(data.results);
        console.log(results);
      })
      .catch((error) => console.error("Error fetching data:", error));
    handleTagChange();
  }, [refreshDisplay]); // Empty dependency array to run effect only once on mount

  useEffect(() => {
    handleTagChange();
  }, [results, sentences]);

  const handleTagChange = (sentenceIndex, posIndex) => {
    // Select all <select> elements on the page
    const selectElements = document.querySelectorAll("select");
    const selectValuesById = {};
    setEdit({});
    // Iterate over each <select> element
    selectElements.forEach((selectElement) => {
      const className = selectElement.className;
      if (className == sentenceIndex) {
        // Get the id of the current <select> element
        if (!selectValuesById.hasOwnProperty(className)) {
          selectValuesById[className] = [];
        }
        selectValuesById[className].push(selectElement.value);
      }
    });
    setEdit(selectValuesById);
  };

  const savePOSEdit = async (index) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/pos_edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          edits: edit,
        }),
      });
      const json = await response.json();
      console.log("resonse", json);
      const tagCounts = {};

      // Iterate over each index in the data object
      Object.entries(json).forEach(([parentIndex, subarrays]) => {
        // Initialize an object to store tag counts for the current parent index
        tagCounts[parentIndex] = {};

        // Iterate over each subarray within the current parent index
        subarrays.forEach((subarray, arrayIndex) => {
          // Initialize an object to store tag counts for the current array index
          tagCounts[parentIndex][arrayIndex] = {};

          // Iterate over each tag within the subarray
          subarray.forEach((tag) => {
            // Initialize count for the current tag if it doesn't exist
            if (!tagCounts[parentIndex][arrayIndex][tag]) {
              tagCounts[parentIndex][arrayIndex][tag] = 0;
            }
            // Increment the count for the current tag
            tagCounts[parentIndex][arrayIndex][tag]++;
          });
        });
      });

      setTagVotes(tagCounts);
      console.log("votes", tagVotes);
      // Optionally handle response
    } catch (error) {
      console.error("Error:", error);
    }
    setEdit({});
  };
  return (
    <div>
      {sentences.map((sentence, index) => (
        <div key={index} style={{ margin: 10 }}>
          <div>{sentence}</div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {results[index].split(" ").map((r, i) => (
              <select
                class={index}
                style={{ marginTop: 20, marginRight: 10 }}
                onChange={() => handleTagChange(index, i)}
              >
                {Object.entries(tagToMeaning).map(([tag, meaning]) => {
                  const count =
                    tagVotes[index] &&
                    tagVotes[index][i] &&
                    tagVotes[index][i][tag]
                      ? tagVotes[index][i][tag]
                      : 0;
                  return (
                    <option key={tag} value={tag}>
                      {meaning} ({count})
                    </option>
                  );
                })}
              </select>
            ))}
          </div>
          <div
            style={{ marginTop: 20, marginBottom: 20 }}
            className="button-group"
          >
            <button onClick={() => savePOSEdit()}>Verify</button>
          </div>
          <hr></hr>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [currentSentence, setCurrentSentence] = useState("");
  const [sentencePosPairs, setSentencePosPairs] = useState([]);
  const [refreshDisplay, setRefreshDisplay] = useState(false);

  const handleGenerateTags = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/pos_tagger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sentence: currentSentence.replace(/\s+/g, " ").trim(),
        }),
      });
      const data = await response.json();
      console.log(data);
      setSentencePosPairs([
        ...sentencePosPairs,
        { sentence: data.sentence, posTags: data.result },
      ]);
      setCurrentSentence("");
      setRefreshDisplay(!refreshDisplay);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="card">
      <h2>Hindi POS Tagger</h2>
      <div style={{ marginBottom: "10px" }}>
        {sentencePosPairs.map((pair, index) => (
          <div key={index}>
            <span>{pair.sentence}</span>
            <span> --&gt; {pair.posTags}</span>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: "100%" }}>
        <input
          type="text"
          style={{
            width: "100%",
            height: "40px",
            border: "1px solid black",
            fontSize: "24px",
          }}
          value={currentSentence}
          onChange={(e) => setCurrentSentence(e.target.value)}
        />
      </div>
      <div className="button-group">
        <button onClick={handleGenerateTags}>Generate tags</button>
      </div>
      <DisplayResults refreshDisplay={refreshDisplay} />
    </div>
  );
}

export default App;
