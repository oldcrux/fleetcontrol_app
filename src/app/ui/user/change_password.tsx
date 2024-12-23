import React, { useState } from "react";
import {
  Button,
  Modal,
  Box,
  TextField,
  Typography,
  IconButton,
  FormHelperText,
} from "@mui/material";
import { Password, Visibility, VisibilityOff } from "@mui/icons-material";
import { updatePassword } from "@/app/lib/user-utils";
import { useSession } from "next-auth/react";
import bcrypt from 'bcryptjs';

type JsonPopupProps = {
    show: boolean;
    onClose: () => void; // A function that takes no arguments and returns nothing
    user: any; // A function that takes parsed JSON data
  };


  export const ChangePassword: React.FC<JsonPopupProps> = ({
    show,
    onClose,
    user
  }) => {
    const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
const [jsonContent, setJsonContent] = useState("");

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId
    ? session?.user?.secondaryOrgId
    : (session?.user?.primaryOrgId as string);

  console.log(user[0]);

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    const pwd  = await bcrypt.hash(newPassword, 10)
    const updatedUser = {
        userId : user[0],
        orgId: orgId,
        password: pwd
    }
    updatePassword(session?.token.idToken, updatedUser);
    setJsonContent('');
      window.location.reload(); 
  };

    return (
        <Modal
        open={show}
      onClose={onClose}
        aria-labelledby="change-password-modal"
        aria-describedby="change-password-form"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" color="primary" gutterBottom>
            Change Password
          </Typography>
          <TextField
            label="New Password"
            type={passwordVisible ? "text" : "password"}
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
            error={!!error}
            helperText={error && error}
          />
          <TextField
            label="Confirm Password"
            type={passwordVisible ? "text" : "password"}
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 2 }}
            error={!!error}
            helperText={error && error}
          />
          {/* <IconButton
            onClick={() => setPasswordVisible((prev) => !prev)}
            edge="end"
            sx={{
              position: "absolute",
              right: "10px",
              top: "calc(50% - 20px)",
            }}
          >
            {passwordVisible ? <VisibilityOff /> : <Visibility />}
          </IconButton> */}

          {error && <FormHelperText error>{error}</FormHelperText>}

          <Box sx={{ mt: 2, textAlign: "right" }}>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
            >
              Save
            </Button>
            <Button onClick={onClose} variant="outlined" color="secondary">
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    );
}