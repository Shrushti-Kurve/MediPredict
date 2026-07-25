import { useState } from "react";
import { predictDisease } from "../api/predictionApi";

function DiseasePrediction() {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [state, setState] = useState("");
  const [disease, setDisease] = useState("");

  const [result, setResult] = useState(null);

  const handlePredict = async () => {
    try {
      const response = await predictDisease({
        year: Number(year),
        month: Number(month),
        state,
        disease_name: disease,
      });

      setResult(response);
    } catch (error) {
      console.log(error);
      alert("Prediction Failed");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Disease Prediction</h1>

      <br />

      <input
        type="number"
        placeholder="Year"
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="Month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="State"
        value={state}
        onChange={(e) => setState(e.target.value)}
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Disease"
        value={disease}
        onChange={(e) => setDisease(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handlePredict}>
        Predict
      </button>

      <br />
      <br />

      {result && (
        <div>
          <h2>Prediction Result</h2>

          <p>
            Predicted Cases:
            <strong> {result.predicted_cases}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default DiseasePrediction;