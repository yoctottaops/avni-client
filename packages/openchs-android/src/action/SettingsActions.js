import SettingsService from "../service/SettingsService";
import _ from 'lodash';
import EntityService from "../service/EntityService";
import {LocaleMapping, Settings, UserInfo} from 'avni-models';
import General from "../utility/General";
import MessageService from "../service/MessageService";
import UserInfoService from '../service/UserInfoService';
import {JSONStringify} from "../utility/JsonStringify";

class SettingsActions {
    static getInitialState(context) {
        const settings = context.get(SettingsService).getSettings();
        const userInfo = context.get(UserInfoService).getUserInfo();
        const localeMappings = context.get(EntityService).getAll(LocaleMapping.schema.name);
        const validationResults = settings.validate();
        const serverURL = settings.serverURL;
        return {
            settings: settings,
            localeMappings: localeMappings,
            validationResults: validationResults,
            userInfo: userInfo,
            serverURL: serverURL,
            advancedMode: false,
            rulesToRun: []
        };
    }

    static clone(state) {
        return {
            settings: state.settings.clone(),
            localeMappings: state.localeMappings,
            userInfo: state.userInfo.clone(),
            rulesToRun: [],
            serverURL: state.serverURL
        };
    }

    static _updateSettingAndSave(state, updateFunc, context, ignoreValidationError = false) {
        const newState = SettingsActions.clone(state);
        updateFunc(newState.settings);
        newState.validationResults = newState.settings.validate();

        if (newState.validationResults.hasNoValidationError() || ignoreValidationError) {
            context.get(SettingsService).saveOrUpdate(newState.settings, Settings.schema.name);
        } else {
            General.logError("SettingsActions", `ValidationError: ${JSONStringify(newState.validationResults)}`);
        }

        return newState;
    }

    static _updateUserSettingsAndSave(state, updateFunc, context) {
        const newState = SettingsActions.clone(state);
        const settings = newState.userInfo.getSettings();
        updateFunc(settings);
        newState.userInfo.setSettings(settings);
        context.get(EntityService).saveAndPushToEntityQueue(newState.userInfo, UserInfo.schema.name);
        return newState;
    }

    static onServerURLChange(state, action, context) {
        return SettingsActions._updateSettingAndSave(state, (settings) => {
            settings.serverURL = action.value
        }, context, true);
    }

    static onLocaleChange(state, action, context) {
        return SettingsActions._updateUserSettingsAndSave(
            state,
            (settings) => {
                settings.locale = action.locale;
                context.get(MessageService).setLocale(action.locale);
            },
            context
        );
    }

    static onLogLevelChange(state, action, context) {
        return SettingsActions._updateSettingAndSave(state, (settings) => {
            settings.logLevel = _.toNumber(action.value)
        }, context);
    }

    static onAdvancedMode(state, action, context) {
        return {...state, advancedMode: !state.advancedMode};
    }

    static onCaptureLocationChange(state, action, context) {
        return SettingsActions._updateUserSettingsAndSave(
            state,
            settings => {
                settings.trackLocation = !settings.trackLocation;
            },
            context
        );
    }

    static onCaptureAutoRefreshChange(state, action, context) {
        return SettingsActions._updateUserSettingsAndSave(
            state,
            settings => {
                settings.disableAutoRefresh = !settings.disableAutoRefresh;
            },
            context
        );
    }

    static onCaptureAutoSyncChange(state, action, context) {
        return SettingsActions._updateUserSettingsAndSave(
            state,
            settings => {
                settings.disableAutoSync = !settings.disableAutoSync;
            },
            context
        );
    }

    static onRuleChange(state, action, context) {
        const ruleToAddRemove = action.value;
        let rulesToRun = state.rulesToRun;
        if (state.rulesToRun.indexOf(ruleToAddRemove) > -1) {
            rulesToRun = rulesToRun.filter(r => r !== ruleToAddRemove);
        } else {
            rulesToRun = rulesToRun.concat([ruleToAddRemove]);
        }
        return {...state, rulesToRun: rulesToRun};
    }
}

const SettingsActionsNames = {
    ON_SERVER_URL_CHANGE: 'S.ON_SERVER_URL_CHANGE',
    ON_LOCALE_CHANGE: 'S.ON_LOCALE_CHANGE',
    ON_LOG_LEVEL_CHANGE: 'S.ON_LOG_LEVEL_CHANGE',
    ON_ADVANCED_MODE: 'S.ON_ADVANCED_MODE',
    ON_RULE_CHANGE: 'S.ON_RULE_CHANGE',
    ON_CAPTURE_LOCATION_CHANGE: 'S.ON_CAPTURE_LOCATION_CHANGE',
    ON_CAPTURE_AUTO_REFRESH_CHANGE: 'S.ON_CAPTURE_AUTO_REFRESH_CHANGE',
    ON_CAPTURE_AUTO_SYNC_CHANGE: 'S.ON_CAPTURE_AUTO_SYNC_CHANGE'
};

const SettingsActionsMap = new Map([
    [SettingsActionsNames.ON_SERVER_URL_CHANGE, SettingsActions.onServerURLChange],
    [SettingsActionsNames.ON_LOCALE_CHANGE, SettingsActions.onLocaleChange],
    [SettingsActionsNames.ON_ADVANCED_MODE, SettingsActions.onAdvancedMode],
    [SettingsActionsNames.ON_LOG_LEVEL_CHANGE, SettingsActions.onLogLevelChange],
    [SettingsActionsNames.ON_RULE_CHANGE, SettingsActions.onRuleChange],
    [SettingsActionsNames.ON_CAPTURE_LOCATION_CHANGE, SettingsActions.onCaptureLocationChange],
    [SettingsActionsNames.ON_CAPTURE_AUTO_REFRESH_CHANGE, SettingsActions.onCaptureAutoRefreshChange],
    [SettingsActionsNames.ON_CAPTURE_AUTO_SYNC_CHANGE, SettingsActions.onCaptureAutoSyncChange]
]);

export {
    SettingsActionsNames,
    SettingsActionsMap,
    SettingsActions
};
