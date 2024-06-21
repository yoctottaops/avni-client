import BaseService from "./BaseService";
import Service from "../framework/bean/Service";
import {UserInfo} from 'avni-models';
import UserSettings from "../model/UserSettings";
import _ from "lodash";

@Service("userInfoService")
class UserInfoService extends BaseService {
    constructor(db, beanStore) {
        super(db, beanStore);
    }

    init() {
    }

    getUserInfo() {
        const userInfo = this.findAll(UserInfo.schema.name);
        if (userInfo === undefined || userInfo.length === 0) return UserInfo.createEmptyInstance();
        return userInfo[0];
    }

    /*
    Deprecated. Use getUserSettingsObject.
     */
    getUserSettings() {
        return this.getUserInfo().getSettings();
    }

    getUserSettingsObject() {
        return new UserSettings(this.getUserSettings());
    }

    getUserSyncSettings() {
        return this.getUserInfo().getSyncSettings();
    }

    getSyncConcept1Values(subjectType) {
        const subjectTypeSyncSettings = this.getSubjectTypeSyncSettings(subjectType);
        return _.get(subjectTypeSyncSettings, 'syncConcept1Values', []);
    }

    getSubjectTypeSyncSettings(subjectType) {
        const subjectTypeSyncSettings = _.get(this.getUserSyncSettings(), 'subjectTypeSyncSettings', []);
        return _.find(subjectTypeSyncSettings, ({subjectTypeUUID}) => subjectTypeUUID === subjectType.uuid);
    }

    getSyncConcept2Values(subjectType) {
        const subjectTypeSyncSettings = this.getSubjectTypeSyncSettings(subjectType);
        return _.get(subjectTypeSyncSettings, 'syncConcept2Values', []);
    }

    saveOrUpdate(entity) {
        return super.saveOrUpdate(entity, UserInfo.schema.name);
    }

    getCreatedBy(entity, I18n) {
        return this.getUserName(entity.createdByUUID, entity.createdBy, I18n);
    }

    getUserName(userUUID, userName, I18n) {
        const userInfo = this.getUserInfo();
        if ((userUUID === userInfo.userUUID) && !_.isNil(userUUID)) return I18n.t("you");
        return userName;
    }
}

export default UserInfoService;
