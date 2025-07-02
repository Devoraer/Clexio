import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Chip,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface AlertItem {
  type: "Material" | "Machine";
  name: string;
  dueDate: string | any;
}

const UpcomingRemindersTable = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/alerts/comingSoon")
      .then((res) => {
        setAlerts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching alerts:", err);
        setLoading(false);
      });
  }, []);

  const parseDate = (raw: any): dayjs.Dayjs | null => {
    if (typeof raw === "string") {
      const parsed = dayjs(raw, ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"], true);
      return parsed.isValid() ? parsed : null;
    }
    if (typeof raw === "object" && raw?.seconds) {
      return dayjs(new Date(raw.seconds * 1000));
    }
    return null;
  };

  const isExpiringSoon = (dueDate: any): boolean => {
    const today = dayjs();
    const due = parseDate(dueDate);
    if (!due) return false;
    const diff = due.diff(today, "day");
    return diff >= 0 && diff <= 10;
  };

  const translateType = (type: string) => {
    if (type === "Material") return "🧪 Material";
    if (type === "Machine") return "🛠️ Machine";
    return type;
  };

  // ✨ סינון חומרים שעומדים בתנאי
  const filteredAlerts = alerts.filter(
    (alert) => alert.type === "Material" && isExpiringSoon(alert.dueDate)
  );

  return (
    <Paper elevation={3} sx={{ overflowX: "auto" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Expiry Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No expiring materials 🟢
                </TableCell>
              </TableRow>
            ) : (
              filteredAlerts.map((alert, index) => (
                <TableRow key={index}>
                  <TableCell>{translateType(alert.type)}</TableCell>
                  <TableCell>{alert.name}</TableCell>
                  <TableCell>{typeof alert.dueDate === "string" ? alert.dueDate : "Invalid Date"}</TableCell>
                  <TableCell>
                    <Chip
                      label="Expiring Soon"
                      color="warning"
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default UpcomingRemindersTable;
