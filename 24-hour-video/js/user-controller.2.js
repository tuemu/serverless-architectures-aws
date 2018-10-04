/**
 * Created by Peter Sbarski
 * Serverless Architectures on AWS
 * http://book.acloud.guru/
 * Last Updated: Feb 11, 2017
 */


var userController = {
  data: {
    auth0Lock: null,
    config: null
  },
  uiElements: {
    loginButton: null,
    logoutButton: null,
    profileButton: null,
    profileNameLabel: null,
    profileImage: null
  },
  init: function(config) {
    var that = this;

    this.uiElements.loginButton = $('#auth0-login');
    this.uiElements.logoutButton = $('#auth0-logout');
    this.uiElements.profileButton = $('#user-profile');
    this.uiElements.profileNameLabel = $('#profilename');
    this.uiElements.profileImage = $('#profilepicture');

    this.data.config = config;
    //this.data.auth0Lock = new Auth0Lock(config.auth0.clientId, config.auth0.domain);
    this.data.auth0Lock = new auth0.WebAuth({
        domain: config.auth0.domain,
        clientID: config.auth0.clientId,
        responseType: 'token id_token',
        //audience: that.data.config.apiBaseUrl + '/user-profile',
        scope: 'openid email user_metadata picture'
        //,redirectUri: 'https://YOUR_APP/callback'
        ,redirect: false
      });

    var idToken = localStorage.getItem('userToken');

    if (idToken) {
      this.configureAuthenticatedRequests();
      this.data.auth0Lock.getProfile(idToken, function(err, profile) {
        if (err) {
          return alert('There was an error getting the profile: ' + err.message);
        }
        that.showUserAuthenticationDetails(profile);
      });
    }

    this.wireEvents();
  },
  configureAuthenticatedRequests: function() {
    $.ajaxSetup({
      'beforeSend': function(xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('userToken'));
      }
    });
  },
  showUserAuthenticationDetails: function(profile) {
    var showAuthenticationElements = !!profile;

    if (showAuthenticationElements) {
      this.uiElements.profileNameLabel.text(profile.nickname);
      this.uiElements.profileImage.attr('src', profile.picture);
    }

    this.uiElements.loginButton.toggle(!showAuthenticationElements);
    this.uiElements.logoutButton.toggle(showAuthenticationElements);
    this.uiElements.profileButton.toggle(showAuthenticationElements);
  },
  wireEvents: function() {
    var that = this;

    this.uiElements.loginButton.click(function(e) {
      var params = {
        authParams: {
          scope: 'openid email user_metadata picture'
        }
      };

    //   that.data.auth0Lock.show(params, function(err, profile, token) {
    //     if (err) {
    //       // Error callback
    //       alert('There was an error');
    //     } else {
    //       // Save the JWT token.
    //       localStorage.setItem('userToken', token);
    //       that.configureAuthenticatedRequests();
    //       that.showUserAuthenticationDetails(profile);
    //     }
    //   });

      that.data.auth0Lock.parseHash(function(err, authResult) {

        var loginBtn = $('#auth0-login');

        loginBtn.click(function(e) {
          e.preventDefault();
          that.data.auth0Lock.authorize();
        });
 
        if (authResult && authResult.accessToken && authResult.idToken) {
            setSession(authResult);
            localStorage.setItem('userToken', authResult.accessToken);
        } else if (err) {
            console.log(err);
            alert(
                'Error: ' + err.error + '. Check the console for further details.'
           );
        }
       });

     
    });

    this.uiElements.logoutButton.click(function(e) {
      localStorage.removeItem('userToken');

      that.uiElements.logoutButton.hide();
      that.uiElements.profileButton.hide();
      that.uiElements.loginButton.show();
    });

    this.uiElements.profileButton.click(function(e) {
      var url = that.data.config.apiBaseUrl + '/user-profile';

      $.get(url, function(data, status) {
          alert(JSON.stringify(data));
        // $('#user-profile-raw-json').text(JSON.stringify(data, null, 2));
        // $('#user-profile-modal').modal();
      })
    });
  }
}
