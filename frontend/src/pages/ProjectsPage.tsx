// 📁 frontend/src/components/ProjectsPage.tsx

import React, { useState, useEffect } from 'react';
import EditProjectDialog from "../components/EditProjectDialog";

import {
  Box, Typography, TextField, Button, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, Stack, LinearProgress,
  IconButton
} from '@mui/material';
import {
  Add, Edit, Delete, Groups
} from '@mui/icons-material';

import dayjs from "dayjs";

interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  teamMembers: number;
  progress: number;
  manager: string;
}

const ProjectsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/projects');
        const data = await res.json();
        setProjects(data);
      } catch (error) {
        console.error('❌ Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const formatDate = (date: string) => {
    const parsed = dayjs(date, ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"]);
    return parsed.isValid()
      ? parsed.format("MMM D, YYYY")
      : "Invalid Date";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Completed': return 'primary';
      case 'On Hold': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'default';
      default: return 'default';
    }
  };

  const filteredProjects = projects.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.manager?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (updatedProject: Project) => {
    try {
      await fetch(`http://localhost:3000/api/projects/${updatedProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProject),
      });

      setProjects(prev =>
        prev.map(p => (p.id === updatedProject.id ? updatedProject : p))
      );
    } catch (error) {
      console.error("❌ Error updating project:", error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          label="Search Projects"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
        <Button variant="contained" startIcon={<Add />}>Add Project</Button>
      </Box>

      <Paper elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Project Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id} hover>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.description}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                    <Groups fontSize="small" color="action" />
                    <Typography variant="caption">{project.teamMembers} members</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip label={project.status} color={getStatusColor(project.status)} size="small" />
                </TableCell>
                <TableCell>
                  <Chip label={project.priority} color={getPriorityColor(project.priority)} size="small" />
                </TableCell>
                <TableCell>{formatDate(project.startDate)}</TableCell>
                <TableCell>{project.endDate ? formatDate(project.endDate) : 'TBD'}</TableCell>
                <TableCell>
                  <Box width={100}>
                    <LinearProgress variant="determinate" value={project.progress} />
                    <Typography variant="caption">{project.progress}%</Typography>
                  </Box>
                </TableCell>
                <TableCell>{project.manager}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedProject(project);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <EditProjectDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        project={selectedProject}
        onSave={handleSave}
      />
    </Box>
  );
};

export default ProjectsPage;
