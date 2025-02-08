import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import styled from 'styled-components';

const ParticipantCardWrapper = styled(Card)`
  width: 100%;
  max-width: 400px;
  margin: 10px 0;
  background-color: linear-gradient(to left, #e0d1f5, #f6ecf3 48%, #e0d1f5);
  border-radius: 10px;
  box-shadow: 2px 5px 5px rgba(0, 0, 0, 0.2);
`;

const StyledButton = styled(Button)`
  font-size: 12px;
  padding: 5px 10px;
  margin-right: 5px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

const InfoRow = styled(Typography)`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin: 5px 0;
`;

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  bloodGroup: string;
  confirmed: boolean;
}

interface ParticipantCardProps {
  participant: Participant;
  handleConfirmation: (id: string, confirmed: boolean) => void;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, handleConfirmation }) => {
  return (
    <ParticipantCardWrapper>
      <CardContent>
        <Typography variant="h6">
          {participant.firstName} {participant.lastName}
        </Typography>
        <InfoRow>
          <PhoneIcon fontSize="small" style={{ marginRight: 5, color: 'black' }} />
          {participant.phoneNumber ? participant.phoneNumber : "Not provided"}
        </InfoRow>
        <InfoRow>
          <BloodtypeIcon fontSize="small" style={{ marginRight: 5, color: 'red' }} />
          {participant.bloodGroup ? participant.bloodGroup : "Not provided"}
        </InfoRow>

        {participant.confirmed ? (
          <InfoRow style={{ color: 'green' }}>
            <CheckCircleIcon fontSize="small" style={{ marginRight: 5, color: 'green' }} /> Checked
          </InfoRow>
        ) : (
          <ButtonContainer>
            <StyledButton variant="outlined" color="success" onClick={() => handleConfirmation(participant.id, true)}>
              Yes
            </StyledButton>
            <StyledButton variant="outlined" color="error" onClick={() => handleConfirmation(participant.id, false)}>
              No
            </StyledButton>
          </ButtonContainer>
        )}
      </CardContent>
    </ParticipantCardWrapper>
  );
};

export default ParticipantCard;
