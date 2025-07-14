import React, { useEffect, useState } from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  Paper, TableContainer, Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface AlertItem {
  id: string;
  type: "Material" | "Machine";
  name: string;
  dueDate: any;
  status: "Expiring Soon" | "Calibration Overdue" | "Calibration Due Soon";
}

const UpcomingRemindersTable = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/alerts/comingSoon")
      .then((res) => {
        setAlerts(res.data);
        console.log("📦 Alerts received:", res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching alerts:", err);
        setLoading(false);
      });
  }, []);

  const renderStatusText = (status: AlertItem["status"]) => {
    let color = "#333";
    if (status === "Calibration Overdue") color = "#d32f2f";
    else if (status === "Expiring Soon" || status === "Calibration Due Soon") color = "#fb8c00";

    return (
      <Typography sx={{ fontWeight: 600, color, textTransform: "capitalize" }}>
        {status}
      </Typography>
    );
  };

  const formatDueDate = (rawDate: any) => {
    if (!rawDate) return "תאריך לא ידוע";

    if (typeof rawDate === "string" && dayjs(rawDate).isValid()) {
      return dayjs(rawDate).format("DD/MM/YYYY");
    }

    if (typeof rawDate?.toDate === "function") {
      return dayjs(rawDate.toDate()).format("DD/MM/YYYY");
    }

    if (rawDate instanceof Date) {
      return dayjs(rawDate).format("DD/MM/YYYY");
    }

    if (typeof rawDate === "string") {
      const parsed = dayjs(rawDate, "DD/MM/YYYY", true);
      return parsed.isValid() ? parsed.format("DD/MM/YYYY") : "תאריך לא ידוע";
    }

    return "תאריך לא ידוע";
  };

  const handleRowClick = (item: AlertItem) => {
    const baseRoute = item.type === "Material" ? "/materials" : "/machines";
    navigate(`${baseRoute}?highlight=${String(item.id)}`);
  };

  if (loading) return <p>⏳ Loading alerts...</p>;

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            {["Type", "Name", "Date", "Status"].map((header, index) => (
              <TableCell
                key={index}
                align="center"
                sx={{
                  fontWeight: "bold",
                  color: "#1976d2",
                  fontSize: "1rem",
                  backgroundColor: "#e3f2fd",
                  textAlign: "left",
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {alerts.map((item, index) => (
            <TableRow
              key={index}
              hover
              onClick={() => handleRowClick(item)}
              sx={{
                cursor: "pointer",
                transition: "0.2s",
                ":hover": { backgroundColor: "#f0f0f0" },
              }}
            >
              <TableCell align="left">{item.type}</TableCell>
              <TableCell align="left">{item.name}</TableCell>
              <TableCell align="left">
                <Typography sx={{ color: formatDueDate(item.dueDate) === "תאריך לא ידוע" ? "gray" : "inherit" }}>
                  {formatDueDate(item.dueDate)}
                </Typography>
              </TableCell>
              <TableCell align="left">{renderStatusText(item.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UpcomingRemindersTable;
