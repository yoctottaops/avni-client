import Service from "../framework/bean/Service";
import { postUrlFormEncoded, putJSON } from "../framework/http/requests";
import General from "../utility/General";
import AuthenticationError, { NO_USER } from "./AuthenticationError";
import BaseAuthProviderService from "./BaseAuthProviderService";
import _ from "lodash";

@Service("keycloakAuthService")
class KeycloakAuthService extends BaseAuthProviderService {
    constructor( db, context ) {
        super(db, context);
    }

    async authenticate( userId, password ) {
        await super.persistUserId(userId);
        const requestBody = {
            username: userId,
            password: password,
        };
        return await this.callKeycloak(requestBody)
            .then(response => response.json())
            .then(async result => {
                return await this.persistTokens(result);
            })
            .then(settings => {
                return {
                    status: "LOGIN_SUCCESS",
                    token: settings.accessToken
                }
            })
            .catch(e => {
                General.logError("Error while authenticating against Keycloak", e);
                throw (new AuthenticationError('Authentication failure', e));
            })

    }

    async userExists() {
        const settings = this.getAuthSettings();
        return !_.isNil(settings.accessToken);
    }

    async getAuthToken() {
        const settings = this.getAuthSettings();
        const accessToken = settings.accessToken;
        if (_.isNil(accessToken) || _.isEmpty(accessToken)) {
            return new AuthenticationError(NO_USER, "No user or needs login");
        }
        if (this.isJWTTokenExpired(accessToken)) {
            const refreshedAccessToken = await this._refreshAccessToken().catch(null);
            if (!_.isNil(refreshedAccessToken)) return refreshedAccessToken;
        }
        return accessToken;
    }

    async _refreshAccessToken() {
        const settings = this.getAuthSettings();
        const refreshToken = settings.refreshToken;
        const requestBody = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        };
        if (!this.isJWTTokenExpired(refreshToken)) {
            return await this.callKeycloak(requestBody)
                .then(response => response.json())
                .then(result => {
                    this.persistTokens(result);
                    return result.access_token
                })
                .catch(e => {
                    General.logError("Error while refreshing token against Keycloak", e);
                    this.persistTokens({access_token: '', refresh_token: ''});
                    return null;
                    // return new AuthenticationError(NO_USER, "No user or needs login");
                })
        }
        return null;
        // fail silently even if refresh token is expired - login will be forced after server rejects next api call with expired token
        // return new AuthenticationError(NO_USER, "No user or needs login");
    }

    async changePassword(oldPassword, newPassword) {
        const settings = this.settingsService.getSettings();
        let authSuccessful = false;
        try {
            const authResult = await this.authenticate(settings.userId, oldPassword)
            authSuccessful = authResult.status === 'LOGIN_SUCCESS';
            if (authSuccessful) {
                const changePasswordEndpoint = `${settings.serverURL}/user/changePassword`;
                try {
                    return await putJSON(changePasswordEndpoint, {newPassword})
                } catch (errorResponse) {
                    let error = await errorResponse.json();
                    let errorText = "New password is " + error.message.replaceAll(":", ",");
                    throw new Error(errorText);
                }
            }
        } catch(e) {
            throw authSuccessful ? e : new Error('Current password is invalid. Unable to authenticate user.');
        }
    }

    async logout() {
        const settings = this.getAuthSettings();
        let newSettings = settings.clone();
        newSettings.accessToken = null;
        newSettings.refreshToken = null;
        newSettings.userId = null;
        newSettings.idpType = null;
        newSettings.keycloakAuthServerUrl = null;
        newSettings.keycloakClientId = null;
        newSettings.keycloakScope = null;
        newSettings.keycloakGrantType = null;
        newSettings.keycloakRealm = null;
        this.settingsService.saveOrUpdate(newSettings);
        return newSettings;
    }

    async persistTokens(authResponse) {
        const settings = this.getAuthSettings();
        let newSettings = settings.clone();
        newSettings.accessToken = authResponse.access_token;
        newSettings.refreshToken = authResponse.refresh_token;
        this.settingsService.saveOrUpdate(newSettings);
        return newSettings;
    }

    async callKeycloak(requestBody) {
        const settings = this.getAuthSettings();
        const endpoint = `${settings.keycloakAuthServerUrl}/realms/${settings.keycloakRealm}/protocol/openid-connect/token`;
        const commonBody = {
            client_id: settings.keycloakClientId,
            scope: settings.keycloakScope,
            grant_type: settings.keycloakGrantType,
        }
        const body = _.merge(commonBody, requestBody);

        return postUrlFormEncoded(endpoint, body);
    }
}

export default KeycloakAuthService;
