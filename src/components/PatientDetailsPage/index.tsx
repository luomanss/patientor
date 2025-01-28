import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import FemaleIcon from "@mui/icons-material/Female";
import MaleIcon from "@mui/icons-material/Male";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import AddEntryForm from "./AddEntryForm";
import {
  Entry,
  EntryType,
  Gender,
  HealthCheckEntry,
  HospitalEntry,
  OccupationalHealthcareEntry,
  Patient,
} from "../../types";
import patientService from "../../services/patients";
import { assertNever } from "../../util";

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
    case EntryType.Hospital:
      return <HospitalEntryDetails entry={entry} />;
    case EntryType.HealthCheck:
      return <HealthCheckEntryDetails entry={entry} />;
    case EntryType.OccupationalHealthcare:
      return <OccupationalHealthcareEntryDetails entry={entry} />;
    default:
      return assertNever(entry);
  }
};

interface ErrorMessage {
  message: string;
  timestamp: number;
}

const ErrorNotification: React.FC<{ error: ErrorMessage | null }> = ({
  error,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (error) {
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!error || !visible) return null;

  return (
    <Box
      sx={{
        backgroundColor: "#f8d7da",
        color: "#721c24",
        padding: "1em",
        borderRadius: "4px",
        marginBottom: "1em",
      }}
    >
      <Typography>{error.message}</Typography>
    </Box>
  );
};

const PatientDetailsPage: React.FC<{ diagnoses: Map<string, string> }> = ({
  diagnoses,
}) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [error, setError] = useState<ErrorMessage | null>(null);
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
      <Box style={{ marginBottom: "1em" }}>
        <Typography>Occupation: {patient.occupation}</Typography>
        {patient.ssn && <Typography>SSN: {patient.ssn}</Typography>}
        <Typography>Date of Birth: {patient.dateOfBirth}</Typography>
      </Box>
      <Box>
        <Typography variant="h5">entries:</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowAddEntry(true)}
          style={{ marginBottom: "1em", marginTop: "0.5em" }}
        >
          Add new entry
        </Button>
        {showAddEntry && (
          <>
            <ErrorNotification error={error} />
            <AddEntryForm
              diagnoses={diagnoses}
              onCancel={() => setShowAddEntry(false)}
              onSubmit={async (values) => {
                try {
                  await patientService.addEntry(patient.id, values);
                  setShowAddEntry(false);
                  setError(null);

                  if (id) {
                    const updatedPatient = await patientService.getById(id);
                    setPatient(updatedPatient);
                  }
                } catch (error) {
                  const errorMessage =
                    error instanceof AxiosError
                      ? error.response?.data.error
                      : "An unknown error occurred";

                  setError({ message: errorMessage, timestamp: Date.now() });
                }
              }}
            />
          </>
        )}
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
