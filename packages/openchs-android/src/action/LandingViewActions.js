import _ from 'lodash'
import CustomDashboardService from '../service/customDashboard/CustomDashboardService';
import General from "../utility/General";
import {JSONStringify} from "../utility/JsonStringify";

function reset(state) {
    return {
        ...state,
        home: false,
        search: false,
        register: false,
        menu: false,
        dashboard: false,
        secondaryDashboardSelected: false
    }
}

class LandingViewActions {
    static getInitialState() {
        return {
            renderCustomDashboard: false,
            dummy: false,
            home: false,
            search: false,
            register: false,
            menu: false,
            dashboard: false,
            syncRequired: true,
            previouslySelectedSubjectTypeUUID: null,
            secondaryDashboard: null,
            secondaryDashboardSelected: false
        };
    }

    static onLoad(state, action, context) {
        const newState = reset(state);
        const syncRequired = _.isNil(action.syncRequired) ? true : action.syncRequired;
        const customDashboardService = context.get(CustomDashboardService);
        const renderCustomDashboard = customDashboardService.isCustomDashboardMarkedPrimary();
        const secondaryDashboard = customDashboardService.getOneSecondaryDashboard();
        return {
            ...newState,
            dummy: !state.dummy,
            home: true,
            syncRequired,
            renderCustomDashboard,
            previouslySelectedSubjectTypeUUID: action.cachedSubjectTypeUUID || newState.previouslySelectedSubjectTypeUUID,
            secondaryDashboard: secondaryDashboard
        };
    }

    static onHomeClick(state) {
        const newState = reset(state);
        return {
            ...newState,
            home: true,
            secondaryDashboardSelected: false
        }
    }

    static onSearchClick(state) {
        const newState = reset(state);
        return {
            ...newState,
            search: true,
            secondaryDashboardSelected: false
        }
    }

    static onDashboardClick(state) {
        const newState = reset(state);
        return {
            ...newState,
            dashboard: true,
        }
    }

    static onRegisterClick(state) {
        const newState = reset(state);
        return {
            ...newState,
            register: true,
            secondaryDashboardSelected: false
        }
    }

    static onMenuClick(state) {
        const newState = reset(state);
        return {
            ...newState,
            menu: true,
            secondaryDashboardSelected: false
        }
    }

    static onSecondaryDashboardClick(state) {
        const newState = reset(state);
        return {
            ...newState,
            secondaryDashboardSelected: true
        }
    }
}

const LandingViewActionsNames = {
    ON_LOAD: 'LVA.ON_LOAD',
    ON_HOME_CLICK: 'LVA.ON_HOME_CLICK',
    ON_SEARCH_CLICK: 'LVA.ON_SEARCH_CLICK',
    ON_DASHBOARD_CLICK: 'LVA.ON_DASHBOARD_CLICK',
    ON_REGISTER_CLICK: 'LVA.ON_REGISTER_CLICK',
    ON_MENU_CLICK: 'LVA.ON_MENU_CLICK',
    ON_SECONDARY_DASHBOARD_CLICK: 'LVA.ON_SECONDARY_DASHBOARD_CLICK'
};

const LandingViewActionsMap = new Map([
    [LandingViewActionsNames.ON_LOAD, LandingViewActions.onLoad],
    [LandingViewActionsNames.ON_HOME_CLICK, LandingViewActions.onHomeClick],
    [LandingViewActionsNames.ON_SEARCH_CLICK, LandingViewActions.onSearchClick],
    [LandingViewActionsNames.ON_REGISTER_CLICK, LandingViewActions.onRegisterClick],
    [LandingViewActionsNames.ON_MENU_CLICK, LandingViewActions.onMenuClick],
    [LandingViewActionsNames.ON_DASHBOARD_CLICK, LandingViewActions.onDashboardClick],
    [LandingViewActionsNames.ON_SECONDARY_DASHBOARD_CLICK, LandingViewActions.onSecondaryDashboardClick]
]);

export {
    LandingViewActions,
    LandingViewActionsNames,
    LandingViewActionsMap
};
