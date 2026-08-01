import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";


function DiseasePrediction() {

  const [patient, setPatient] = useState({
    name:"",
    age:"",
    gender:"",
    symptoms:""
  });


  const [result,setResult] = useState(null);


  const handleChange = (e)=>{

    setPatient({
      ...patient,
      [e.target.name]:e.target.value
    });

  };


  const predictDisease = (e)=>{

    e.preventDefault();


    // Dummy prediction result
    const prediction = {

      disease:"Malaria",

      accuracy:"92%",

      recommendation:
      "Consult doctor and perform blood test."

    };


    setResult(prediction);

  };



  return (

    <>

    <Sidebar />


    <div className="dashboard-container">


      <Navbar />


      <div className="dashboard-content">


        <h1>Disease Prediction</h1>



        <div className="prediction-container">



          <form 
          className="prediction-form"
          onSubmit={predictDisease}
          >


            <h2>Patient Information</h2>


            <input

            type="text"

            name="name"

            placeholder="Patient Name"

            value={patient.name}

            onChange={handleChange}

            />



            <input

            type="number"

            name="age"

            placeholder="Age"

            value={patient.age}

            onChange={handleChange}

            />




            <select

            name="gender"

            value={patient.gender}

            onChange={handleChange}

            >

              <option value="">
                Select Gender
              </option>

              <option>
                Male
              </option>

              <option>
                Female
              </option>


            </select>




            <textarea

            name="symptoms"

            placeholder="Enter Symptoms (fever, cough, headache)"

            value={patient.symptoms}

            onChange={handleChange}

            />


            <button type="submit">

              Predict Disease

            </button>



          </form>





          {

          result &&

          <div className="prediction-result">


            <h2>
              Prediction Result
            </h2>


            <h3>
              Disease: {result.disease}
            </h3>


            <p>
              Accuracy: {result.accuracy}
            </p>


            <p>
              Advice: {result.recommendation}
            </p>



          </div>

          }



        </div>


      </div>


    </div>


    </>

  );

}


export default DiseasePrediction;