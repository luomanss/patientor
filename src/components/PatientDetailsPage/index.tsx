import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Entry,
  Gender,
  HealthCheckEntry,
  HospitalEntry,
  OccupationalHealthcareEntry,
  Patient,
} from "../../types";
import patientService from "../../services/patients";
import { Box, Typography } from "@mui/material";
import FemaleIcon from "@mui/icons-material/Female";
import MaleIcon from "@mui/icons-material/Male";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";

const assertNever = (value: never): never => {
  throw new Error(
    `Unhandled discriminated union member: ${JSON.stringify(value)}`
  );
};

const HospitalEntryDetails: React.FC<{ entry: HospitalEntry }> = ({
  entry,
}) => {
  return (
    <div>
      <Typography>Discharge: {entry.discharge.date}</Typography>
      <Typography>Criteria: {entry.discharge.criteria}</Typography>
    </div>
  );
};

const HealthCheckEntryDetails: React.FC<{ entry: HealthCheckEntry }> = ({
  entry,
}) => {
  return (
    <div>
      <Typography>Health check rating: {entry.healthCheckRating}</Typography>
    </div>
  );
};

const OccupationalHealthcareEntryDetails: React.FC<{
  entry: OccupationalHealthcareEntry;
}> = ({ entry }) => {
  return (
    <div>
      <Typography>Employer: {entry.employerName}</Typography>
      {entry.sickLeave && (
        <div>
          <Typography>
            Sick leave: {entry.sickLeave.startDate} - {entry.sickLeave.endDate}
          </Typography>
        </div>
      )}
    </div>
  );
};

const EntryDetails: React.FC<{ entry: Entry }> = ({ entry }) => {
  switch (entry.type) {
    case "Hospital":
      return <HospitalEntryDetails entry={entry} />;
    case "HealthCheck":
      return <HealthCheckEntryDetails entry={entry} />;
    case "OccupationalHealthcare":
      return <OccupationalHealthcareEntryDetails entry={entry} />;
    default:
      return assertNever(entry);
  }
};

const PatientDetailsPage: React.FC<{ diagnoses: Map<string, string> }> = ({
  diagnoses,
}) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const { id } = useParams<{ id: string }>();

  console.log("diagnoses", diagnoses);

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
      <Box style={{ marginBottom: "1em" }}>
        <Typography>Occupation: {patient.occupation}</Typography>
        {patient.ssn && <Typography>SSN: {patient.ssn}</Typography>}
        <Typography>Date of Birth: {patient.dateOfBirth}</Typography>
      </Box>
      <Box>
        <Typography variant="h5">entries:</Typography>
        {patient.entries?.map((entry) => (
          <Box
            key={entry.id}
            style={{
              border: "1px solid #ccc",
              padding: "1em",
              marginBottom: "1em",
            }}
          >
            <Typography variant="h6">{entry.date}</Typography>
            <Typography variant="body1">{entry.description}</Typography>
            <ul>
              {entry.diagnosisCodes?.map((code) => (
                <li key={code}>
                  <Typography>
                    {code}: {diagnoses.get(code)}
                  </Typography>
                </li>
              ))}
            </ul>
            <EntryDetails entry={entry} />
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default PatientDetailsPage;
