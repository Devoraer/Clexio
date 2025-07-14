// ✅ CalendarPage.tsx – כולל תמיכה מלאה ב־_seconds, toDate ו־מחרוזות
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIos";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [alertsByDate, setAlertsByDate] = useState<{ [date: string]: string[] }>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const today = dayjs();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      const resMaterials = await axios.get("http://localhost:3000/api/alerts/comingSoon");
      const resMachines = await axios.get("http://localhost:3000/api/machines/all");

      const formattedAlerts: { [date: string]: string[] } = {};

      // 🧪 חומרים
      resMaterials.data.forEach((alert: any) => {
        let dateObj: dayjs.Dayjs | null = null;

        if (typeof alert.dueDate === "string" && alert.dueDate.includes("/")) {
          const [day, month, year] = alert.dueDate.split("/").map(Number);
          dateObj = dayjs(new Date(year, month - 1, day));
        } else if (alert.dueDate?.toDate) {
          dateObj = dayjs(alert.dueDate.toDate());
        }

        if (!dateObj || !dateObj.isValid()) return;

        const dateKey = dateObj.format("YYYY-MM-DD");

        const label =
          alert.type === "Material"
            ? alert.status?.toLowerCase() === "expired"
              ? `Material Expired::${alert.name}::${alert.id}`
              : `Material Expiry Soon::${alert.name}::${alert.id}`
            : alert.status === "Calibration Overdue"
            ? `Calibration Overdue::${alert.name}::${alert.id}`
            : `Calibration Due Soon::${alert.name}::${alert.id}`;

        if (!formattedAlerts[dateKey]) formattedAlerts[dateKey] = [];
        formattedAlerts[dateKey].push(label);
      });

      // 🛠 מכונות
      resMachines.data.forEach((machine: any) => {
        const addMachineAlert = (rawDate: any, status: string) => {
          let dateObj: dayjs.Dayjs;

          if (rawDate?.toDate) {
            dateObj = dayjs(rawDate.toDate());
          } else if (rawDate?._seconds) {
            dateObj = dayjs(new Date(rawDate._seconds * 1000));
          } else if (typeof rawDate === "string" && rawDate.includes("/")) {
            const [day, month, year] = rawDate.split("/").map(Number);
            dateObj = dayjs(new Date(year, month - 1, day));
          } else {
            dateObj = dayjs(rawDate);
          }

          if (!dateObj.isValid()) return;

          const dateKey = dateObj.format("YYYY-MM-DD");
          const label = `${status}::${machine["Instrument ID"]}::${machine.ID}`;

          if (!formattedAlerts[dateKey]) formattedAlerts[dateKey] = [];
          formattedAlerts[dateKey].push(label);
        };

        if (machine["Calibration Date"]) {
          addMachineAlert(machine["Calibration Date"], "Calibration Performed");
        }

        if (Array.isArray(machine["CalibrationHistory"])) {
          machine["CalibrationHistory"].forEach((entry: any) => {
            if (entry?.date) {
              addMachineAlert(entry.date, "Calibration History");
            }
          });
        }
      });

      setAlertsByDate(formattedAlerts);
    };

    fetchAlerts();
  }, []);

  const startOfMonth = currentDate.startOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = currentDate.daysInMonth();
  const totalCells = startDay + daysInMonth;
  const numRows = Math.ceil(totalCells / 7);

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const nextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  const calendarMatrix: (dayjs.Dayjs | null)[][] = [];
  let week: (dayjs.Dayjs | null)[] = [];

  for (let i = 0; i < startDay; i++) week.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(currentDate.date(day));
    if (week.length === 7) {
      calendarMatrix.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    calendarMatrix.push(week);
  }
  while (calendarMatrix.length < numRows) {
    calendarMatrix.push(Array(7).fill(null));
  }

 const handleNavigation = (type: string, name: string, id: string) => {
    if (type.includes("Material")) {
        navigate(`/materials?highlight=${id}`); // 👈 כאן העדכון
    } else {
        navigate(`/machines?highlight=${id}`);
    }
    setOpenDialog(false);
    };


  return (
    <Box
      sx={{
        width: "calc(100vw - 370px)",
        maxWidth: "100%",
        height: "100vh",
        overflow: "hidden",
        padding: 0.5,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          padding: 2,
          borderRadius: 3,
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <IconButton onClick={prevMonth}><ArrowBackIcon /></IconButton>
          <Typography variant="h4" fontWeight={600}>
            {currentDate.format("MMMM YYYY")}
          </Typography>
          <IconButton onClick={nextMonth}><ArrowForwardIcon /></IconButton>
        </Box>

        <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={1} mb={1}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Box key={day} textAlign="center" fontWeight={600}>
              {day}
            </Box>
          ))}
        </Box>

        <Box
          display="grid"
          gridTemplateColumns="repeat(7, 1fr)"
          gridTemplateRows={`repeat(${numRows}, 1fr)`}
          gap={1}
          flexGrow={1}
          minHeight={0}
          overflow="hidden"
        >
          {calendarMatrix.flat().map((date, idx) => {
            const isToday = date?.isSame(today, "day");
            const formatted = date?.format("YYYY-MM-DD");
            const alerts = formatted && alertsByDate[formatted];

            return (
              <Box
                key={idx}
                sx={{
                  width: "100%",
                  height: `calc((100vh - 320px) / ${numRows})`,
                  backgroundColor: isToday ? "#e3f2fd" : "#fff",
                  border: alerts ? "2px solid #ffa726" : "1px solid #ccc",
                  borderRadius: 2,
                  padding: 1,
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {date ? date.date() : ""}
                </Typography>

                {alerts?.length > 0 && (
                  <Chip
                    label={`${alerts.length} alerts`}
                    onClick={() => {
                      setSelectedAlerts(alerts);
                      setSelectedDate(date?.format("YYYY-MM-DD") || "");
                      setOpenDialog(true);
                    }}
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: "#ffa726",
                      color: "#000",
                      fontWeight: 600,
                      fontSize: 10,
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Alerts for {selectedDate}</DialogTitle>
            <DialogContent>
            {selectedAlerts.map((alert, idx) => {
                const [type, name, id] = alert.split("::");

                const isMaterial = type.includes("Material");
                const status = type.replace("Material ", "").replace("Calibration ", "");
                const color =
                status.toLowerCase().includes("expired") ? "error" :
                status.toLowerCase().includes("due") ? "warning" :
                status.toLowerCase().includes("performed") ? "success" :
                "default";

                return (
                <Box
                    key={idx}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                    p={1.2}
                    border="1px solid #ddd"
                    borderRadius={2}
                    bgcolor="#f9f9f9"
                >
                    <Box>
                    <Typography fontWeight={600} fontSize={14}>
                        {isMaterial ? "🧪 Material" : "🛠 Machine"}: {name}
                    </Typography>
                    <Chip
                        label={status}
                        color={color as any}
                        size="small"
                        sx={{ mt: 0.5 }}
                    />
                    </Box>

                    <Button
                    variant="outlined"
                    size="small"
                    sx={{ ml: 1, textTransform: "none" }}
                    onClick={() => handleNavigation(type, name, id)}
                    >
                    View
                    </Button>
                </Box>
                );
            })}
            </DialogContent>


      </Dialog>
    </Box>
  );
};

export default CalendarPage;
