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
    this.data.auth0Lock = new Auth0Lock(config.auth0.clientId, config.auth0.domain);

    that.data.auth0Lock.on('authenticated', function(authResult) {
      that.data.auth0Lock.getUserInfo(authResult.accessToken, function(error, profile) {
        if (error) {
          // Handle error
          return;
        }


        console.log('authResult.accessToken' + authResult.accessToken);
        console.log('JSON.stringify(profile)' + JSON.stringify(profile));

        localStorage.setItem('userToken', authResult.accessToken);
        that.configureAuthenticatedRequests();
        that.showUserAuthenticationDetails(profile);
      });
    });

    // ,
    //   {
    //     auth: {
    //       responseType: 'token id_token',
    //       params: {
    //         scope: 'openid email user_'
    //       }
    //     }
    //   }
    // );

    // this.data.auth0Lock.on('authenticated', function(authResult) {
    //   this.data.auth0Lock.getUserInfo(authResult.accessToken, function(error, profile) {
    //     if (error) {
    //       // Handle error
    //       return;
    //     }

    //     localStorage.setItem('userToken', authResult.accessToken);
    //     that.showUserAuthenticationDetails(JSON.stringify(profile));
    //   });
    // });


    var idToken = localStorage.getItem('userToken');

    if (idToken) {
      this.configureAuthenticatedRequests();

      this.data.auth0Lock.getUserInfo(idToken, function(err, profile) {
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
    console.log('profile2: ' + profile[1]);
    console.log('profile.picture: ' + JSON.stringify(profile.picture));
    
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
      that.data.auth0Lock.show();
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
