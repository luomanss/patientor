// src/components/AddEntryForm/index.tsx
import { useState } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Box,
  Typography,
  Rating,
} from "@mui/material";
import { Entry, HealthCheckRating } from "../../types";
import { UnionOmit } from "../../util";

type EntryFormValues = UnionOmit<Entry, "id">;

interface Props {
  onSubmit: (values: EntryFormValues) => void;
  onCancel: () => void;
}

const AddEntryForm = ({ onSubmit, onCancel }: Props) => {
  const [entryType, setEntryType] = useState<Entry["type"]>("HealthCheck");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [specialist, setSpecialist] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [diagnosisCodes, setDiagnosisCodes] = useState<string[]>([]);

  // HealthCheck specific state
  const [healthCheckRating, setHealthCheckRating] = useState<HealthCheckRating>(
    HealthCheckRating.Healthy
  );

  // OccupationalHealthcare specific state
  const [employerName, setEmployerName] = useState("");
  const [sickLeaveStart, setSickLeaveStart] = useState("");
  const [sickLeaveEnd, setSickLeaveEnd] = useState("");

  // Hospital specific state
  const [dischargeDate, setDischargeDate] = useState("");
  const [dischargeCriteria, setDischargeCriteria] = useState("");

  const onEntryTypeChange = (type: Entry["type"]) => {
    setEntryType(type);
    // Reset form when type changes
  };

  const baseFields = (
    <>
      <TextField
        label="Date"
        type="date"
        fullWidth
        value={date}
        onChange={(e) => setDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Description"
        fullWidth
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Specialist"
        fullWidth
        value={specialist}
        onChange={(e) => setSpecialist(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
    </>
  );

  const typeSpecificFields = () => {
    switch (entryType) {
      case "HealthCheck":
        return (
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <Typography component="legend">Health Check Rating</Typography>
            <Rating
              max={3}
              value={healthCheckRating}
              onChange={(_, value) =>
                value !== null && setHealthCheckRating(value)
              }
            />
          </FormControl>
        );
      case "OccupationalHealthcare":
        return (
          <>
            <TextField
              label="Employer Name"
              fullWidth
              value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <Typography>Sick Leave (optional)</Typography>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={sickLeaveStart}
              onChange={(e) => setSickLeaveStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={sickLeaveEnd}
              onChange={(e) => setSickLeaveEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ marginBottom: 2 }}
            />
          </>
        );
      case "Hospital":
        return (
          <>
            <TextField
              label="Discharge Date"
              type="date"
              fullWidth
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="Discharge Criteria"
              fullWidth
              value={dischargeCriteria}
              onChange={(e) => setDischargeCriteria(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
          </>
        );
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const baseEntry = {
      description,
      date,
      specialist,
      diagnosisCodes,
    };

    let entryValues: EntryFormValues;

    switch (entryType) {
      case "HealthCheck":
        entryValues = {
          ...baseEntry,
          type: "HealthCheck",
          healthCheckRating,
        };
        break;
      case "OccupationalHealthcare":
        entryValues = {
          ...baseEntry,
          type: "OccupationalHealthcare",
          employerName,
          ...(sickLeaveStart && sickLeaveEnd
            ? {
                sickLeave: {
                  startDate: sickLeaveStart,
                  endDate: sickLeaveEnd,
                },
              }
            : {}),
        };
        break;
      case "Hospital":
        entryValues = {
          ...baseEntry,
          type: "Hospital",
          discharge: {
            date: dischargeDate,
            criteria: dischargeCriteria,
          },
        };
        break;
    }

    onSubmit(entryValues);
  };

  return (
    <form onSubmit={submit}>
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>Entry Type</InputLabel>
        <Select
          value={entryType}
          onChange={(e) => onEntryTypeChange(e.target.value as Entry["type"])}
          label="Entry Type"
        >
          <MenuItem value="HealthCheck">Health Check</MenuItem>
          <MenuItem value="OccupationalHealthcare">
            Occupational Healthcare
          </MenuItem>
          <MenuItem value="Hospital">Hospital</MenuItem>
        </Select>
      </FormControl>

      {baseFields}
      {typeSpecificFields()}

      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button type="submit" variant="contained" color="primary">
          Add
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </form>
  );
};

export default AddEntryForm;