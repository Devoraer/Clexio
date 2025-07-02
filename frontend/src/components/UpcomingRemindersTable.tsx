import React, { useEffect, useState } from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  Paper, TableContainer, Chip
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface AlertItem {
  type: "Material" | "Machine";
  name: string;
  dueDate: string; // תאריך תפוגה או כיול
  status: "Expiring Soon" | "Calibration Overdue" | "Calibration Due Soon";
}

const UpcomingRemindersTable = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/alerts/comingSoon") // 🔗 תוודאי שה־API הזה קיים!
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

  const renderStatusChip = (status: AlertItem["status"]) => {
    let color: "warning" | "error" | "info" = "info";
    if (status === "Expiring Soon") color = "warning";
    else if (status === "Calibration Overdue") color = "error";
    else if (status === "Calibration Due Soon") color = "warning";

    return <Chip label={status} color={color} />;
  };

  if (loading) return <p>⏳ Loading alerts...</p>;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>📦 סוג</TableCell>
            <TableCell>🔤 שם</TableCell>
            <TableCell>📅 תאריך</TableCell>
            <TableCell>⚠️ סטטוס</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {alerts.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.type}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{dayjs(item.dueDate).format("DD/MM/YYYY")}</TableCell>
              <TableCell>{renderStatusChip(item.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UpcomingRemindersTable;
