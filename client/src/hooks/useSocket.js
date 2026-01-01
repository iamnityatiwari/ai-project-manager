import { useEffect, useContext } from 'react';
import { socket } from '../api/socket';
import AuthContext from '../context/AuthContext';

export const useSocket = (onNotification) => {
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user) return;

        // Connect socket
        socket.connect();

        // Join user-specific room
        socket.emit('join', user._id);

        // Listen for notifications
        if (onNotification) {
            socket.on('notification', onNotification);
        }

        // Cleanup
        return () => {
            socket.off('notification');
            socket.disconnect();
        };
    }, [user, onNotification]);

    return socket;
};

export default useSocket;
