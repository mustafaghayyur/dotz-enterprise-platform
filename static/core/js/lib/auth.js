/**
 * Auth lib
 * @todo: complete all operations..
 * @returns 
 */


function getAccessToken() {
    // retrieves time of last token refresh
    const lastAccess = tokenLastRefreshed();

    // check if token is older than 60 minutes
    if (lastAccess - Date.now() > 3600000) {
        // refresh token
        return refreshToken();
    } else {
        return getCurrentAccessToken();
    }
}

function tokenLastRefreshed(){
    return null;
}

function refreshToken() {
    const lastRefreshed = $A.app.memFetch('token_last_refreshed');

    if (lastRefreshed > Date.now() - 86400) {
        throw new Error('Your session has expired. Please login again to continue.');
    }

    const request = defineRequest('api.auth.refresh', '', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    Fetcher(request, 'tokenRefreshContainer', {}, (response) => {
        if (response.status === 200) {
            return response.json().then(data => {
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                localStorage.setItem('token_last_refreshed', Date.now().toString());
                return data.access;
            });
        } else {
            throw new Error('refreshToken() - failed to refresh token, status: ' + response.status);
        }
    });
}