import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Gender, Patient } from "../../types";
import patientService from "../../services/patients";
import { Typography } from "@mui/material";
import FemaleIcon from "@mui/icons-material/Female";
import MaleIcon from "@mui/icons-material/Male";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";

const PatientDetailsPage = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchPatient = async () => {
      if (id) {
        try {
          const patientData = await patientService.getById(id);

          setPatient(patientData);
        } catch (error) {
          console.error("Error fetching patient details:", error);
        }
      }
    };

    fetchPatient();
  }, [id]);

  if (!patient) {
    return <div>Loading...</div>;
  }

  const genderIcon = () => {
    if (patient.gender == Gender.Female) {
      return <FemaleIcon />;
    } else if (patient.gender == Gender.Male) {
      return <MaleIcon />;
    } else {
      return <QuestionMarkIcon fontSize="small" />;
    }
  };

  return (
    <div>
      <Typography variant="h4" style={{ marginTop: "0.5em" }}>
        {patient.name} {genderIcon()}
      </Typography>
      <Typography>Occupation: {patient.occupation}</Typography>
      {patient.ssn && <Typography>SSN: {patient.ssn}</Typography>}
      {patient.dateOfBirth && (
        <Typography>Date of Birth: {patient.dateOfBirth}</Typography>
      )}
    </div>
  );
};

export default PatientDetailsPage;
