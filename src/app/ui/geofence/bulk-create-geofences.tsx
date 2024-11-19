import React, { useState } from "react";
import { Modal, Box, Button, TextField, Typography } from "@mui/material";

type JsonPopupProps = {
  show: boolean;
  onClose: () => void; // A function that takes no arguments and returns nothing
  onSave: (data: any) => void; // A function that takes parsed JSON data
};

export const BulkCreateGeofences: React.FC<JsonPopupProps> = ({
  show,
  onClose,
  onSave,
}) => {
  const [jsonContent, setJsonContent] = useState("");

  const handleSave = () => {
    try {
      const parsedData = JSON.parse(jsonContent);
      onSave(parsedData);
      setJsonContent('');
    } catch (error) {
      alert("Invalid JSON format. Please correct it.");
    }
  };

  return (
    <Modal
      open={show}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800, // Increased width
          height: 700, // Increased height
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 2, // Increased padding
          borderRadius: 2,
          overflow: "auto", // Ensures content scrolls if it overflows
        }}
      >
        <Typography variant="h6" color="black" component="h2" id="modal-title" gutterBottom>
          Bulk Create Geofences
        </Typography>
        <TextField
          label="Paste JSON Content"
          multiline
          rows={24} // Increased rows to fit more content in the expanded modal
          fullWidth
          variant="outlined"
          value={jsonContent}
          onChange={(e) => setJsonContent(e.target.value)}
          placeholder="Paste your JSON content here"
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const styles = {
  overlay: {
    // position: 'fixed',
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  textarea: {
    width: "100%",
    height: "150px",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    padding: "8px",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
  },
  button: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#0070f3",
    color: "#fff",
  },
};
