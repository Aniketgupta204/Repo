// config/roles.js
const ROLES = {
    SUPER_ADMIN: 'super_admin',
    SCHOOL_ADMIN: 'school_admin',
    TEACHER: 'teacher'
};

const PERMISSIONS = {
    MANAGE_SCHOOLS: 'manage_schools',
    MANAGE_USERS: 'manage_users',
    MANAGE_CLASSROOMS: 'manage_classrooms',
    MANAGE_STUDENTS: 'manage_students',
    VIEW_DASHBOARD: 'view_dashboard'
};

const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: ['*'],
    [ROLES.SCHOOL_ADMIN]: [
        PERMISSIONS.MANAGE_CLASSROOMS,
        PERMISSIONS.MANAGE_STUDENTS,
        PERMISSIONS.VIEW_DASHBOARD
    ],
    [ROLES.TEACHER]: [
        PERMISSIONS.VIEW_DASHBOARD
    ]
};

module.exports = {
    ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS
};
