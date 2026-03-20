/**
 * constants.js will always carry important lists/variables our software needs.
 */

export default {
    settingsUrl: '/rest/settings-general/', // always-available settings url
    screens: {
        xs: 575,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400,
    },
    user: {
        levels: {
            member: 10,
            leader: 20,
            manager: 30,
            director: 50,
            executive: 70,
            sysadmin: 90,
            supadmin: 99
        }
    }
};

