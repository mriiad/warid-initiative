import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Card, CardContent, Typography, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';


const EventContainer = styled.div`
  margin-top: 90px;
  margin-bottom: 58px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 10px;
`;

const ParticipantCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  margin: 10px 0;
  background-color: transparent !important;
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

const PaginationButton = styled(Button)`
  text-transform: none;
`;

interface Participant {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  bloodGroup: string;
  confirmed: boolean;
}

const EventParticipants: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();

  // Sample data for participants
  const [allParticipants, setAllParticipants] = useState<Participant[]>(
    Array.from({ length: 32 }, (_, i) => ({
      id: i,
      firstName: `First ${i + 1}`,
      lastName: `Last ${i + 1}`,
      phone: `06${Math.floor(10000000 + Math.random() * 90000000)}`,
      bloodGroup: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'][i % 8],
      confirmed: false,  
    }))
  );

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 8;
  const totalPages = Math.ceil(allParticipants.length / rowsPerPage);

  
  const visibleParticipants = useMemo(
    () => allParticipants.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage),
    [allParticipants, currentPage]
  );

  const handleConfirmation = (id: number, isPresent: boolean) => {
    setAllParticipants(prevParticipants =>
      prevParticipants.map(participant =>
        participant.id === id ? { ...participant, confirmed: true } : participant
      )
    );

    console.log(isPresent ? "Donation date should be updated." : "Donation date should not be updated.");
  };

  return (
    <EventContainer>
      <Typography variant="h5" align="center">
        List of Participants for this event: {reference}
      </Typography>

      {visibleParticipants.map((participant) => (
        <ParticipantCard key={participant.id}>
          <CardContent>
            <Typography variant="h6">{participant.firstName} {participant.lastName}</Typography>
            <InfoRow><PhoneIcon fontSize="small" style={{ marginRight: 5, color: 'black' }} /> {participant.phone}</InfoRow>
            <InfoRow><BloodtypeIcon fontSize="small" style={{ marginRight: 5, color: 'red' }} /> {participant.bloodGroup}</InfoRow>

            {participant.confirmed ? (
              <InfoRow style={{ color: 'green' }}>
                <CheckCircleIcon fontSize="small" style={{ marginRight: 5, color: 'green' }}/> Checked
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
        </ParticipantCard>
      ))}

      <ButtonContainer>
        <PaginationButton
          variant="text"
          color="primary"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          Previous
        </PaginationButton>
        <PaginationButton
          variant="text"
          color="primary"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
          disabled={currentPage === totalPages - 1}
        >
          Next
        </PaginationButton>
      </ButtonContainer>
    </EventContainer>
  );
};

export default EventParticipants;
