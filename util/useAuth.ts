import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { DeviceEventEmitter } from 'react-native';

export const useAuth = (mockDate?: string) => {
    const [user, setUser] = useState(() => {
        try {
            const data = localStorage.getItem('user');
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        const listener = DeviceEventEmitter.addListener('userlogin', () => {
            try {
                const updatedUser = JSON.parse(localStorage.getItem('user') || 'null');
                setUser(updatedUser);
            } catch (e) {
                console.error("Auth update error", e);
            }
        });
        return () => listener.remove();
    }, []);

    const canEdit = useMemo(() => {
        if (!user || !user.username || !user.roles) {
            return false;
        }


        const rolesArray = user.roles.split('|');
        const isManager = rolesArray.includes('Manager');
        const isTL = rolesArray.includes('team_leader');

        const checkDate = mockDate ? dayjs(mockDate) : dayjs();
        const firstDayNextMonth = checkDate.add(1, 'month').startOf('month');
        const openingStart = firstDayNextMonth.subtract(7, 'days');

        const isWindowOpen = (checkDate.isAfter(openingStart, 'day') || checkDate.isSame(openingStart, 'day'))
            && checkDate.isBefore(firstDayNextMonth, 'day');

        return isManager || (isTL && isWindowOpen);
    }, [user, mockDate]);

    return {
        user,
        username: user?.username || "",
        canEdit: !!canEdit,
        isManager: user?.roles?.includes('Manager') || false
    };
};