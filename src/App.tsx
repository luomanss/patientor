import { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { Button, Divider, Container, Typography } from "@mui/material";

import { apiBaseUrl } from "./constants";
import { Diagnosis, Patient } from "./types";
import PatientDetailsPage from "./components/PatientDetailsPage";

import patientService from "./services/patients";
import PatientListPage from "./components/PatientListPage";

const App = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [diagnoses, setDiagnoses] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    axios.get<void>(`${apiBaseUrl}/ping`);

    const fetchPatientList = async () => {
      const patients = await patientService.getAll();
      setPatients(patients);
    };

    fetchPatientList();
  }, []);

  useEffect(() => {
    const fetchDiagnoses = async () => {
      const { data: diagnoses } = await axios.get<Diagnosis[]>(
        `${apiBaseUrl}/diagnoses`
      );
      setDiagnoses(new Map(diagnoses.map((d) => [d.code, d.name])));
    };

    fetchDiagnoses();
  }, []);

  return (
    <div className="App">
      <Router>
        <Container>
          <Typography variant="h3" style={{ marginBottom: "0.5em" }}>
            Patientor
          </Typography>
          <Button component={Link} to="/" variant="contained" color="primary">
            Home
          </Button>
          <Divider hidden />
          <Routes>
            <Route
              path="/"
              element={
                <PatientListPage
                  patients={patients}
                  setPatients={setPatients}
                />
              }
            />
            <Route
              path="/patients/:id"
              element={<PatientDetailsPage diagnoses={diagnoses} />}
            />
          </Routes>
        </Container>
      </Router>
    </div>
  );
};

export default App;
