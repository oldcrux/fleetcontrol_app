import { Box, IconButton, Modal } from "@mui/material";
import Geofences from "./geofences";
import CloseIcon from "@mui/icons-material/Close";
// import Modal from "react-modal";

type JsonPopupProps = {
  show: boolean;
  onClose: () => void;
};

export const GeofencesModal: React.FC<JsonPopupProps> = ({ show, onClose }) => {
  return (
    <Modal
      open={show}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: "relative",
          margin: "2%",
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 24,
          p: 4,
          maxHeight: "95vh",
          overflow: "auto",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 2,
            right: 2,
          }}
        >
          <CloseIcon />
        </IconButton>
        <Geofences onClose={onClose}/>
      </Box>
    </Modal>
  );
};
