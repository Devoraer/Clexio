import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FolderIcon from "@mui/icons-material/Folder";
import dayjs from "dayjs";
import axios from "axios";
import Grid from '@mui/material/Grid';


interface Project {
  id: string;
  projectName: string;
  startDate: string;
}

const ProjectCard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/project/all");
        setProjects(res.data); // מניחים שזה מערך של פרויקטים
      } catch (error) {
        console.error("שגיאה בעת שליפת הפרויקטים:", error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Project List
      </Typography>

      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card elevation={3}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <FolderIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    {project.projectName}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarMonthIcon fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Start Date:{" "}
                    {dayjs(project.startDate, "DD/MM/YYYY").format("DD MMM YYYY")}
                  </Typography>
                </Stack>

                <Box mt={2}>
                  <Chip label={`ID: ${project.id}`} variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProjectCard;
