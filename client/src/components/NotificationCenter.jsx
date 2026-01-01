import { useState, useEffect } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography, Box, Divider, Button, ListItemText, ListItemIcon } from '@mui/material';
import { Notifications as NotificationsIcon, CheckCircle as CheckCircleIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../api/axios';
import { useSocket } from '../hooks/useSocket';

const NotificationCenter = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications?limit=10');
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Listen for real-time notifications
    useSocket((notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 10));
        setUnreadCount(prev => prev + 1);
    });

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            const wasUnread = notifications.find(n => n._id === id)?.read === false;
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'task_assigned':
                return 'primary.light';
            case 'task_completed':
                return 'success.light';
            case 'deadline_approaching':
                return 'warning.light';
            default:
                return 'grey.200';
        }
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: { width: 360, maxHeight: 480 }
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Notifications</Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={markAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </Box>
                <Divider />

                {notifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                            No notifications
                        </Typography>
                    </MenuItem>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification._id}
                            sx={{
                                backgroundColor: notification.read ? 'transparent' : getNotificationColor(notification.type),
                                '&:hover': { backgroundColor: notification.read ? 'action.hover' : getNotificationColor(notification.type) },
                                py: 1.5
                            }}
                        >
                            <Box sx={{ width: '100%' }}>
                                <ListItemText
                                    primary={notification.message}
                                    secondary={new Date(notification.createdAt).toLocaleString()}
                                    primaryTypographyProps={{
                                        fontWeight: notification.read ? 'normal' : 'bold',
                                        fontSize: '0.9rem'
                                    }}
                                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                />
                                <Box display="flex" gap={1} mt={0.5}>
                                    {!notification.read && (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notification._id);
                                            }}
                                            title="Mark as read"
                                        >
                                            <CheckCircleIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification._id);
                                        }}
                                        title="Delete"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
};

export default NotificationCenter;
