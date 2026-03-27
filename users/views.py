from django.shortcuts import render
from django.contrib.auth.forms import AuthenticationForm

def register(request):
    """
        @todo: add proper welcome message for new users.
    """
    context = {
        'loginRequired': 'false',
    }
    return render(request, 'core/generic.html', context)



def login(request):
    """
        Handle user login with JWT token generation.
        GET: Display login form
    """
    form = AuthenticationForm()
    context = {
        'loginRequired': 'false',
        'next': 'task_index',
        'form': form,
    }
    return render(request, 'auth/login.html', context)

def logout(request):
    """
        Handle user logout by destroying JWT tokens.
        Displays logout confirmation page
    """
    context ={
        'loginRequired': 'false',
        'loggedOut': 'true',
    }
    # Create response with logout page
    response = render(request, 'auth/logged_out.html', context)
    
    # Delete authentication cookies
    response.delete_cookie('access_token', path='/')
    response.delete_cookie('refresh_token', path='/')
    
    return response

"""
    Password Change is an authenticated-user's operation. Login required.
"""
def changePassword(request):
    context ={
        'loginRequired': 'true',
    }
    render(request, 'auth/password_change_form.html', context)

def changePasswordDone(request):
    context ={
        'loginRequired': 'true',
    }
    render(request, 'auth/password_change_done.html', context)

"""
    All Password-Reset views allow for non-authenticated users to reset password.
"""
def passwordReset1(request):
    context ={
        'loginRequired': 'false',
    }
    render(request, 'auth/password_reset_form.html', context)

def passwordReset2(request):
    context ={
        'loginRequired': 'false',
    }
    render(request, 'auth/password_reset_done.html', context)

def passwordReset3(request):
    context ={
        'loginRequired': 'false',
    }
    render(request, 'auth/password_reset_confirm.html', context)

def passwordReset4(request):
    context ={
        'loginRequired': 'false',
    }
    render(request, 'auth/password_reset_comlplete.html', context)


