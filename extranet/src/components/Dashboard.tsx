import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useDashboard } from "@/hooks/useUsers";
import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import OpacityIcon from "@mui/icons-material/Opacity";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

export default function Dashboard() {
  const { userId } = useAuth();
  const { data, isLoading, isError, error } = useDashboard(userId);

  useEffect(() => {
    if (data) {
      console.log("Dashboard data:", data);
    }
  }, [data]);

  if (isLoading) return <Typography p={2}>Loading dashboard...</Typography>;
  if (isError)
    return (
      <Typography p={2} color="error">
        Error loading dashboard: {error?.message || "Unknown error"}
      </Typography>
    );

  const stats = data?.stats ?? { total: 0, lastDonation: "-", eligibleIn: "-" };
  const donations = data?.donations ?? [];
  

  return (
    <Box p={2} display="flex" flexDirection="column" gap={3}>
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          sx={{
            background: "linear-gradient(135deg, #e53935, #e35d5b)",
            color: "white",
            borderRadius: 3,
            p: 2,
          }}
        >
          <Typography variant="h6">Welcome</Typography>
          <Typography variant="body2">
            Thanks you for being part of the warid community and helping saving live
          </Typography>
        </Card>
      </motion.div>

      <Box display="flex" gap={2} flexWrap="wrap">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
          style={{ flex: "1 1 30%" }}
        >
          <Card sx={{ borderRadius: 3, textAlign: "center", p: 2, boxShadow: 3 }}>
            <FavoriteIcon color="error" fontSize="large" />
            <Typography variant="subtitle2">Total Donations</Typography>
            <Typography variant="h6">{stats.total}</Typography>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
          style={{ flex: "1 1 30%" }}
        >
          <Card sx={{ borderRadius: 3, textAlign: "center", p: 2, boxShadow: 3 }}>
            <AccessTimeIcon color="primary" fontSize="large" />
            <Typography variant="subtitle2">Next Donation</Typography>
            <Typography variant="h6">{stats.eligibleIn}</Typography>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
          style={{ flex: "1 1 30%" }}
        >
          <Card sx={{ borderRadius: 3, textAlign: "center", p: 2, boxShadow: 3 }}>
            <CalendarMonthIcon color="warning" fontSize="large" />
            <Typography variant="subtitle2">Last donation</Typography>
            <Typography variant="h6">{stats.lastDonation}</Typography>
          </Card>
        </motion.div>
      </Box>

      <Box display="flex" flexDirection="column" gap={2}>
        <Typography variant="h5">Your donations history</Typography>
        {donations.length > 0 ? (
          donations.map((d) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6">{d.event}</Typography>

                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Typography variant="body2">{d.date}</Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <OpacityIcon fontSize="small" color="error" />
                    <Typography variant="body2">{d.type}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Box textAlign="center" py={4}>
            <FavoriteBorderIcon color="disabled" fontSize="large" sx={{ mb: 1 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              You haven't made any donations yet!
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Join our community of heroes and start saving lives today. Explore upcoming events and make your first donation!
            </Typography>
            <Button
              variant="contained"
              color="error"
              href="/events?page=1"
              sx={{ mt: 2 }}
            >
              See Upcoming Events
            </Button>
          </Box>

        )}
      </Box>


    </Box>
  );
}
