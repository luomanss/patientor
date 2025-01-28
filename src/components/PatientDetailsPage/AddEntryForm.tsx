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
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import {
  Entry,
  EntryFormValues,
  EntryType,
  HealthCheckRating,
} from "../../types";

import { assertNever } from "../../util";

interface Props {
  diagnoses: Map<string, string>;
  onSubmit: (values: EntryFormValues) => void;
  onCancel: () => void;
}

const AddEntryForm = ({ diagnoses, onSubmit, onCancel }: Props) => {
  const [entryType, setEntryType] = useState<Entry["type"]>(
    EntryType.HealthCheck
  );
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [specialist, setSpecialist] = useState("");
  const [diagnosisCodes, setDiagnosisCodes] = useState<string[]>([]);
  const [healthCheckRating, setHealthCheckRating] = useState<HealthCheckRating>(
    HealthCheckRating.Healthy
  );

  const [employerName, setEmployerName] = useState("");
  const [sickLeaveStart, setSickLeaveStart] = useState("");
  const [sickLeaveEnd, setSickLeaveEnd] = useState("");
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
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>Diagnosis Codes</InputLabel>
        <Select
          multiple
          value={diagnosisCodes}
          onChange={(e) => {
            const value = e.target.value;
            setDiagnosisCodes(
              typeof value === "string" ? value.split(",") : value
            );
          }}
          label="Diagnosis Codes"
        >
          {Array.from(diagnoses.entries()).map(([code, name]) => (
            <MenuItem key={code} value={code}>
              {code} - {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );

  const typeSpecificFields = () => {
    switch (entryType) {
      case EntryType.HealthCheck:
        return (
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <Typography component="legend">Health Check Rating</Typography>
            <Rating
              max={3}
              precision={1}
              value={healthCheckRating}
              onChange={(_, value) => setHealthCheckRating(value ?? 0)}
              icon={<FavoriteIcon fontSize="inherit" />}
              emptyIcon={<FavoriteBorderIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
          </FormControl>
        );
      case EntryType.OccupationalHealthcare:
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
              sx={{ marginBottom: 2, marginTop: 1 }}
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
      case EntryType.Hospital:
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
      default:
        assertNever(entryType);
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
      case EntryType.HealthCheck:
        entryValues = {
          ...baseEntry,
          type: EntryType.HealthCheck,
          healthCheckRating,
        };
        break;
      case EntryType.OccupationalHealthcare:
        entryValues = {
          ...baseEntry,
          type: entryType,
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
      case EntryType.Hospital:
        entryValues = {
          ...baseEntry,
          type: entryType,
          discharge: {
            date: dischargeDate,
            criteria: dischargeCriteria,
          },
        };
        break;
      default:
        assertNever(entryType);
    }

    onSubmit(entryValues!);
  };

  return (
    <Box
      style={{
        border: "1px solid #ccc",
        padding: "1em",
        marginBottom: "1em",
      }}
    >
      <form onSubmit={submit}>
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Entry Type</InputLabel>
          <Select
            value={entryType}
            onChange={(e) => onEntryTypeChange(e.target.value as Entry["type"])}
            label="Entry Type"
          >
            <MenuItem value={EntryType.HealthCheck}>Health Check</MenuItem>
            <MenuItem value={EntryType.OccupationalHealthcare}>
              Occupational Healthcare
            </MenuItem>

            <MenuItem value={EntryType.Hospital}>Hospital</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            {baseFields}
          </Box>
          <Box sx={{ flex: 1 }}>
            {typeSpecificFields()}
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            Add
          </Button>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AddEntryForm;
