import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Chip,
  Divider,
  Stack
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Upload as UploadIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';

const initialProfile = {
  name: '',
  email: '',
  phone: '',
  department: 'Sales',
  hireDate: '2023-01-10',
  salary: 65000,
  status: 'Active',
  avatarUrl: ''
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userAPI.getProfile();
        const data = res.data || {};
        setProfile((prev) => ({
          ...prev,
          name: data.name || user?.name || '',
          email: data.email || user?.email || '',
          phone: typeof data.phone === 'number' ? String(data.phone) : (data.phone || ''),
          department: data.department || prev.department,
          hireDate: data.hireDate || prev.hireDate,
          salary: data.salary || prev.salary,
          status: data.status || prev.status,
          avatarUrl: data.avatarUrl || ''
        }));
      } catch (e) {
        setProfile((prev) => ({
          ...prev,
          name: user?.name || prev.name,
          email: user?.email || prev.email
        }));
      }
    };
    fetchProfile();
  }, [user]);

  const statusColor = useMemo(() => (profile.status === 'Active' ? 'success' : 'default'), [profile.status]);

  const validate = () => {
    const newErrors = {};
    if (!profile.name.trim()) newErrors.name = 'Name is required';
    if (!emailRegex.test(profile.email)) newErrors.email = 'Enter a valid email';
    if (profile.phone && !/^\d{7,15}$/.test(profile.phone)) newErrors.phone = 'Phone must be 7-15 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleToggleEdit = async () => {
    if (editing) {
      if (!validate()) return;
      try {
        await userAPI.updateProfile({ name: profile.name, email: profile.email, phone: profile.phone });
        // Notify other parts of the app (e.g., Employees page) to refresh
        window.dispatchEvent(new Event('profileUpdated'));
      } catch (e) {
        // keep UI optimistic for now
      }
    }
    setEditing((v) => !v);
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setAvatarFile(file);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    const form = new FormData();
    form.append('avatar', avatarFile);
    try {
      const res = await userAPI.uploadAvatar(form);
      setProfile((p) => ({ ...p, avatarUrl: res.data?.avatarUrl || p.avatarUrl }));
      setAvatarFile(null);
    } catch (e) {
      setAvatarFile(null);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={4}>
            {/* Left: Avatar */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2} alignItems="center">
                <Avatar src={profile.avatarUrl || undefined} sx={{ width: 128, height: 128, fontSize: 48 }}>
                  {profile.name?.charAt(0) || 'U'}
                </Avatar>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                    Choose
                    <input hidden accept="image/*" type="file" onChange={handleAvatarSelect} />
                  </Button>
                  <Button variant="contained" disabled={!avatarFile} onClick={handleUploadAvatar}>
                    Upload
                  </Button>
                </Stack>
                {avatarFile && (
                  <Typography variant="caption" color="textSecondary">
                    Selected: {avatarFile.name}
                  </Typography>
                )}
              </Stack>
            </Grid>

            {/* Right: Details */}
            <Grid item xs={12} md={8}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      disabled={!editing}
                      error={!!errors.name}
                      helperText={errors.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      disabled={!editing}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      disabled={!editing}
                      error={!!errors.phone}
                      helperText={errors.phone}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} display="flex" alignItems="center" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
                    <Button
                      variant={editing ? 'contained' : 'outlined'}
                      startIcon={editing ? <SaveIcon /> : <EditIcon />}
                      onClick={handleToggleEdit}
                    >
                      {editing ? 'Save' : 'Edit'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Employment Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <ReadOnlyField label="Department" value={profile.department} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ReadOnlyField label="Hire Date" value={formatDate(profile.hireDate)} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ReadOnlyField label="Salary" value={`$${Number(profile.salary).toLocaleString()}`} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Status
                      </Typography>
                      <Chip color={statusColor} label={profile.status} sx={{ mt: 0.5 }} />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

const ReadOnlyField = ({ label, value }) => (
  <Box>
    <Typography variant="body2" color="textSecondary">
      {label}
    </Typography>
    <Typography variant="subtitle1">
      {value || '-'}
    </Typography>
  </Box>
);

const formatDate = (iso) => {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
};

export default ProfilePage;


