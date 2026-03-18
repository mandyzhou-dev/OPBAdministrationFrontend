import { useMemo } from 'react';
import dayjs from 'dayjs';

export const useAuth = (mockDate?: string) => {
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') as string);
        } catch {
            return {};
        }
    }, []);
    if (!user) {
        return { 
            user: null, 
            canEdit: false, 
            isManager: false, 
            username: "" 
        };
    }

    const canEdit = useMemo(() => {
        if (!user.roles || !user.username) return false;

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
        username: user.username,
        canEdit, 
        isManager: user.roles?.includes('Manager')
    };
};