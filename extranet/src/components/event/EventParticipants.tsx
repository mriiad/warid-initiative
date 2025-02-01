import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Typography, Button, CircularProgress } from '@mui/material';
import { fetchEventAttendees, attendeeConfirmation } from '../../utils/queries';
import { useAuth } from '../../auth/AuthContext';
import ParticipantCard from './ParticipantCard';

const EventContainer = styled.div`
  margin-top: 90px;
  margin-bottom: 58px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

const PaginationButton = styled(Button)`
  text-transform: none;
`;

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  bloodGroup: string;
  confirmed: boolean;
}

const EventParticipants: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const { token } = useAuth();

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  
  useEffect(() => {
    if (!token || !reference) return; 
  
    const loadParticipants = async () => {
      try {
        setLoading(true);
        const data = await fetchEventAttendees(reference, token);
        setParticipants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    loadParticipants();
  }, [reference, token]); 
  

  useEffect(() => {
    if (participants) {
      setTotalPages(Math.max(1, Math.ceil(participants.length / rowsPerPage)));
    }
  }, [participants]);

  const visibleParticipants = participants?.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  ) || [];

  const handleConfirmation = async (id: string, confirmed: boolean) => {
    try {
      if (!token) {
        throw new Error("User is not authenticated");
      }

      await attendeeConfirmation(reference,id, token);

      setParticipants((prevParticipants) =>
        prevParticipants
          ? prevParticipants.map((participant) =>
            participant.id === id ? { ...participant, confirmed: true } : participant
          )
          : []
      );
    } catch (error: any) {
      setError(error.message);
    }
  };
  
  if (error) {
    return (
      <Typography align="center" color="error">
        Error: {error}
      </Typography>
    );
  }

  return (
    <EventContainer>
      <Typography variant="h5" align="center">
        The list of Participants:
      </Typography>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </div>
      ) : participants === null || participants.length === 0 ? (
        <Typography align="center">No participants found.</Typography>
      ) : (
        <>
          {visibleParticipants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              handleConfirmation={handleConfirmation}
            />
          ))}
          {totalPages > 1 && (
            <ButtonContainer>
              {page > 1 && (
                <PaginationButton
                  variant="text"
                  color="primary"
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  Previous
                </PaginationButton>
              )}
              {page < totalPages && (
                <PaginationButton
                  variant="text"
                  color="primary"
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </PaginationButton>
              )}
            </ButtonContainer>
          )}

        </>
      )}
    </EventContainer>
  );
};

export default EventParticipants;
