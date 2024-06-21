import PropTypes from 'prop-types';
import {TouchableNativeFeedback, TouchableOpacity, View} from "react-native";
import React from "react";
import AbstractComponent from "../../framework/view/AbstractComponent";
import {Text} from "native-base";
import {Actions} from "../../action/individual/IndividualProfileActions";
import Reducers from "../../reducer";
import Colors from "../primitives/Colors";
import Distances from "../primitives/Distances";
import Fonts from "../primitives/Fonts";
import CHSNavigator from "../../utility/CHSNavigator";
import General from "../../utility/General";
import DGS from "../primitives/DynamicGlobalStyles";
import Styles from "../primitives/Styles";
import ActionSelector from "./ActionSelector";
import _ from "lodash";
import {ProgramEnrolment, WorkItem, WorkList, WorkLists} from "avni-models";
import GroupSubjectService from "../../service/GroupSubjectService";
import TypedTransition from "../../framework/routing/TypedTransition";
import GenericDashboardView from "../program/GenericDashboardView";
import Menu from "../menu";
import MenuItem from "../menu/MenuItem";
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {MessageIcon} from "./MessageIcon";
import CommentView from "../comment/CommentView";
import OrganisationConfigService from "../../service/OrganisationConfigService";
import SubjectProfilePicture from "./SubjectProfilePicture";
import PhoneCall from "../../model/PhoneCall";
import CustomActivityIndicator from "../CustomActivityIndicator";
import AvniIcon from "../common/AvniIcon";
import GlificScheduledAndSentMsgsView from '../glific/GlificScheduledAndSentMsgsView';

class IndividualProfile extends AbstractComponent {
    static propTypes = {
        individual: PropTypes.object.isRequired,
        viewContext: PropTypes.string,
        programsAvailable: PropTypes.bool,
        hideEnrol: PropTypes.bool,
        textColor: PropTypes.string,
        displayOnly: PropTypes.bool.isRequired
    };

    static viewContext = {
        Wizard: 'Wizard',
        NonWizard: 'NonWizard'
    };

    constructor(props, context) {
        super(props, context, props.displayOnly ? null : Reducers.reducerKeys.individualProfile);
    }

    getMobileNoFromObservation() {
        let i;
        for (i = 0; i < this.props.individual.observations.length; i++) {
            return this.props.individual.getMobileNo();
        }
    }

    renderCallButton() {
        const number = this.getMobileNoFromObservation();
        if (number) {
            return (
                <MaterialIcon name="call" size={30}
                              style={{color: Styles.accentColor}}
                              onPress={() => this.makeCall(number)}/>
            );
        } else {
            return (
                <View/>
            );
        }
    }

    renderWhatsappButton(individualUUID) {
        const number = this.getMobileNoFromObservation();
        const {enableMessaging} = this.getService(OrganisationConfigService).getSettings();

        if (number && enableMessaging) {
            return (<View>
                <TouchableNativeFeedback onPress={() => this.showWhatsappMessages(individualUUID)}>
                    <View>
                        <AvniIcon type="MaterialCommunityIcons" name="whatsapp"
                                  style={{fontSize: 30}} color={Styles.accentColor}/>
                    </View>
                </TouchableNativeFeedback>
            </View>);
        } else {
            return (
                <View/>
            );
        }
    }

    showWhatsappMessages(individualUUID) {
        TypedTransition.from(this).with({individualUUID}).to(GlificScheduledAndSentMsgsView, true);
    }

    makeCall(number) {
        PhoneCall.makeCall(number, this,
            (displayProgressIndicator) => this.dispatchAction(Actions.TOGGLE_PROGRESS_INDICATOR, {displayProgressIndicator}));
    }

    componentDidMount() {
        if (this.props.displayOnly) return;

        const individual = this.props.individual;
        const programEnrolmentCallback = (program) => {
            const enrolment = ProgramEnrolment.createEmptyInstance({individual, program});
            CHSNavigator.navigateToProgramEnrolmentView(this, enrolment, new WorkLists(new WorkList('Enrol', [
                new WorkItem(General.randomUUID(), WorkItem.type.PROGRAM_ENROLMENT, {
                    programName: program.name,
                    subjectUUID: _.get(individual, 'uuid')
                })
            ])));
        };
        setTimeout(() => this.dispatchAction(Actions.INDIVIDUAL_SELECTED, {individual, programEnrolmentCallback}), 300);
    }


    programProfileHeading() {
        const fullAddress = this.props.individual.fullAddress(this.I18n);
        return this.props.individual.subjectType.isPerson() ?
            <Text
                style={Styles.programProfileSubheading}>{this.I18n.t(this.props.individual.gender.name)}, {this.props.individual.getAgeAndDateOfBirthDisplay(this.I18n)}, {fullAddress}</Text> :
            <Text
                style={Styles.programProfileSubheading}>{fullAddress}</Text>
    }

    renderProfileActionButton(iconMode, displayTextMessageKey, onPress) {
        return (<TouchableNativeFeedback onPress={onPress}>
            <View style={{
                flexDirection: 'row',
                paddingHorizontal: DGS.resizeWidth(6),
                alignItems: 'center', justifyContent: 'flex-start', marginLeft: 16, backgroundColor: Styles.greyBackground,
                borderRadius: 5
            }}>
                <AvniIcon name={iconMode} style={{
                    fontSize: DGS.resizeWidth(Styles.programProfileButtonText.fontSize),
                    color: Colors.DarkPrimaryColor,
                    paddingRight: 4
                }} type='MaterialIcons'/>
                <Text style={Styles.programProfileButtonText}>{displayTextMessageKey}</Text>
            </View>
        </TouchableNativeFeedback>);
    }

    groupActions() {
        const groupSubjects = this.getService(GroupSubjectService).getAllGroups(this.props.individual);
        return groupSubjects.map(groupSubject => ({
            fn: () => {
                TypedTransition.from(this).resetStack([GenericDashboardView],
                    [TypedTransition.createRoute(GenericDashboardView, {
                        individualUUID: groupSubject.groupSubject.uuid,
                        tab: 1
                    }, true)])
            },
            label: groupSubject.groupSubject.firstName,
            isHousehold: groupSubject.groupSubject.isHousehold(),
        }))
    }

    setMenuRef = ref => {
        this._menu = ref;
    };
    showMenu = () => {
        this._menu.show();
    };

    onMessagePress() {
        const individualUUID = this.props.individual.uuid;
        const refreshCountActionName = Actions.REFRESH_MESSAGE_COUNTS;
        TypedTransition.from(this).with({individualUUID, refreshCountActionName}).to(CommentView, true);
    }

    renderGroupOptions() {
        const groupActions = this.groupActions();
        if (groupActions.length === 0) {
            return null
        } else {
            return groupActions.length === 1 ? this.renderGroupButton(groupActions[0]) : this.renderMenu(groupActions);
        }

    }

    renderGroupButton(groupAction) {
        const label = groupAction.isHousehold ? 'household' : 'group';
        return <TouchableOpacity onPress={groupAction.fn} style={{
            paddingVertical: 1,
            paddingHorizontal: 10,
            marginEnd: 16,
            alignItems: 'center',
            backgroundColor: Styles.greyBackground,
            borderRadius: 5
        }}>
            <Text style={{color: Styles.accentColor}}>{`${groupAction.label} ${this.I18n.t(label)}`}</Text>
        </TouchableOpacity>
    }

    renderMenu(groupActions) {
        return <Menu
            ref={this.setMenuRef}
            button={<TouchableOpacity onPress={this.showMenu}>
                <MaterialIcon
                    name='more-vert'
                    size={25}
                    color={Colors.TextOnPrimaryColor}/>
            </TouchableOpacity>}>
            <MenuItem onPress={_.noop} disabled disabledTextColor={Colors.DefaultPrimaryColor}>Member of
                groups:</MenuItem>
            {groupActions.map(({fn, label}) => (
                <MenuItem onPress={fn} textStyle={{color: Colors.Complimentary}}>{label}</MenuItem>))}
        </Menu>;
    }

    renderCommentIcon() {
        const {enableComments} = this.getService(OrganisationConfigService).getSettings();
        return enableComments ?
            <MessageIcon messageCount={this.state.commentsCount} onPress={this.onMessagePress.bind(this)}/> : <View/>;
    }

    renderNameDirectly(programAction) {
        return this.renderProfileActionButton('add', this.I18n.t('enrolIn', {program: this.I18n.t(programAction.label)}), () => programAction.fn())
    }

    renderTitle() {
        return this.renderProfileActionButton('add', this.I18n.t('enrolInProgram'), () => this.launchChooseProgram())
    }

    renderBasedOnProgramActions() {
        return _.size(this.state.programActions) === 1 ? this.renderNameDirectly(_.head(this.state.programActions)) : this.renderTitle();
    }

    render() {
        General.logDebug('IndividualProfile', 'render');
        let isPerson = this.props.individual.subjectType.isPerson();
        let headingSuffixesList = [this.props.individual.fullAddress(this.I18n)]
        if (isPerson) {
            headingSuffixesList.unshift(this.props.individual.userProfileSubtext2(this.I18n)); //localized Age
            headingSuffixesList.unshift(this.props.individual.userProfileSubtext1(this.I18n)); //localized Gender
        }
        let headingSuffix = _.join(headingSuffixesList, ", ")
        return <View style={{backgroundColor: Styles.whiteColor}}>
            {(this.props.viewContext !== IndividualProfile.viewContext.Wizard) ?
                (
                    <>
                        <CustomActivityIndicator loading={this.state.displayProgressIndicator}/>
                        <View>
                            <ActionSelector
                                title={this.I18n.t("enrolInProgram")}
                                hide={() => this.dispatchAction(Actions.HIDE_ACTION_SELECTOR)}
                                visible={this.state.displayActionSelector}
                                actions={this.state.programActions}
                            />
                            <View style={{flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingBottom: 10, backgroundColor: Styles.greyBackground}}>
                                <View style={{
                                    paddingHorizontal: 20,
                                    justifyContent: 'center',
                                }}>
                                    <SubjectProfilePicture
                                        size={DGS.resizeWidth(75)}
                                        subjectType={this.props.individual.subjectType}
                                        style={{alignSelf: 'center'}}
                                        round={true}
                                        allowEnlargementOnClick={true}
                                        individual={this.props.individual}
                                    />
                                </View>
                                <View style={{flex: 1, paddingHorizontal: 5}}>
                                    <Text
                                        style={Styles.programProfileHeading}>{this.props.individual.getTranslatedNameString(this.I18n)} {this.props.individual.id}</Text>
                                    {this.programProfileHeading()}
                                </View>

                                <View style={{flexDirection: 'column', paddingRight: 15}}>
                                    {this.renderCommentIcon()}
                                    {this.renderCallButton()}
                                    {this.renderWhatsappButton(this.props.individual.uuid)}
                                </View>
                            </View>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    paddingVertical: 8,
                                    alignItems: 'center',
                                    backgroundColor: Styles.whiteColor
                                }}>
                                {(!this.props.hideEnrol && !_.isEmpty(this.state.eligiblePrograms)) ? this.renderBasedOnProgramActions() :
                                    <View/>}
                                {this.renderGroupOptions()}
                            </View>
                        </View></>
                ) :
                (
                    <View style={this.appendedStyle({
                        flexDirection: 'column',
                        backgroundColor: Styles.greyBackground,
                        paddingHorizontal: Distances.ContentDistanceFromEdge,
                        paddingVertical: Distances.ContentDistanceFromEdge
                    })}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={[Fonts.LargeBold, {color: Styles.blackColor}]}>{this.props.individual.nameString}</Text>
                        </View>
                        <Text style={Styles.subjectProfileSubheading}>{headingSuffix}</Text>
                    </View>
                )}
        </View>;
    }

    launchChooseProgram() {
        this.dispatchAction(Actions.LAUNCH_ACTION_SELECTOR);
    }
}

export default IndividualProfile;
