import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Table, TableHead, TableBody, TableRow, TableCell, Button, TableFooter } from '@mui/material';


const EventContainer = styled.div`
  margin-top: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
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

    // Sample data
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

    const visibleParticipants = allParticipants.slice(
        currentPage * rowsPerPage,
        (currentPage + 1) * rowsPerPage
    );
 
    const handleConfirmation = (id: number, isPresent: boolean) => {
        setAllParticipants(prevParticipants =>
          prevParticipants.map(participant =>
            participant.id === id ? { ...participant, confirmed: true } : participant
          )
        );
    
        if (isPresent) {
          console.log("Donation date should be updated.");
        } else {
          console.log("Donation date should not be updated.");
        }
      };
    return (
        <EventContainer>
            <h3>List of Participants for Event : {reference}</h3>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell><strong>First Name</strong></TableCell>
                        <TableCell><strong>Last Name</strong></TableCell>
                        <TableCell><strong>Phone Number</strong></TableCell>
                        <TableCell><strong>Blood Group</strong></TableCell>
                        <TableCell><strong>Confirm Presence</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {visibleParticipants.map((participant, index) => (
                        <TableRow key={index}>
                            <TableCell>{participant.firstName}</TableCell>
                            <TableCell>{participant.lastName}</TableCell>
                            <TableCell>{participant.phone}</TableCell>
                            <TableCell>{participant.bloodGroup}</TableCell>
                            <TableCell>
                                {participant.confirmed ? (
                                    <p>Done ✅</p>
                                ) : (
                                    <>
                                        <Button variant="outlined" color="success"
                                            onClick={ () => handleConfirmation(participant.id, true)}
                                        >Yes</Button>
                                        <Button variant="outlined" color="error" style={{ marginLeft: '10px' }}
                                            onClick={() => handleConfirmation(participant.id, false)}
                                        >No</Button>
                                    </>
                                )

                                }

                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>

                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={5} align="center">
                            <Button
                                variant="text"
                                color="primary"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                                disabled={currentPage === 0}
                                style={{ marginRight: '10px' }}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="text"
                                color="primary"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                                disabled={currentPage === totalPages - 1}
                            >
                                Next
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </EventContainer>
    );
};

export default EventParticipants;
