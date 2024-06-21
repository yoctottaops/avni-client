import AbstractComponent from "../../framework/view/AbstractComponent";
import PropTypes from "prop-types";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import ListView from "deprecated-react-native-listview";
import Separator from "../primitives/Separator";
import React from "react";
import Fonts from "../primitives/Fonts";
import _ from 'lodash';
import Styles from "../primitives/Styles";
import Colors from "../primitives/Colors";
import ProgramEncounterService from "../../service/program/ProgramEncounterService";
import {Badge} from "../common/Badge";
import ProgramEnrolmentService from "../../service/ProgramEnrolmentService";
import Actions from "./Actions";
import IndividualRelationshipService from "../../service/relationship/IndividualRelationshipService";
import EncounterService from "../../service/EncounterService";
import SubjectProfilePicture from "../common/SubjectProfilePicture";
import ListViewHelper from "../../utility/ListViewHelper";
import {GroupSubject} from "openchs-models";

class Members extends AbstractComponent {
    static propTypes = {
        groupSubjects: PropTypes.object.isRequired,
        title: PropTypes.string,
        onMemberSelection: PropTypes.func.isRequired,
        actions: PropTypes.array.isRequired,
        editAllowed: PropTypes.bool,
        removeAllowed: PropTypes.bool,
    };

    constructor(props, context) {
        super(props, context);
    }

    getTextComponent(text, color) {
        return <Text key={text} style={{fontSize: Styles.smallTextSize, color: color}}>{text}</Text>
    }

    renderGroupMember(groupSubject) {
        const memberSubject = groupSubject.memberSubject;
        const component = this.getTextComponent(memberSubject.nameString, Colors.Complimentary);
        const undoneProgramVisits = this.getService(ProgramEncounterService).getAllDueForSubject(memberSubject.uuid).length;
        const undoneGeneralVisits = this.getService(EncounterService).getAllDueForSubject(memberSubject.uuid).length;
        const roleDescription = groupSubject.getRoleDescription(this.getRelatives(groupSubject));
        return (<View style={{marginLeft: 2, flexDirection: 'column', alignItems: 'flex-start'}}>
                <Badge number={undoneProgramVisits + undoneGeneralVisits} component={component}/>
                {<Text key={roleDescription}
                       style={{ fontSize: 12}}>{this.I18n.t(roleDescription)}</Text>}
            </View>
        )
    }

    getRelatives(groupSubject) {
        const headOfHouseholdGroupSubject = groupSubject.groupSubject.getHeadOfHouseholdGroupSubject();
        return _.isEmpty(headOfHouseholdGroupSubject) ? [] : this.getService(IndividualRelationshipService).getRelatives(headOfHouseholdGroupSubject.memberSubject);
    }

    renderEnrolledPrograms(memberSubject) {
        const nonExitedEnrolledPrograms = this.getService(ProgramEnrolmentService).getAllNonExitedEnrolmentsForSubject(memberSubject.uuid);
        return _.map(nonExitedEnrolledPrograms, (enl, index) => this.renderProgram(enl.program, index));
    }

    renderProgram(program, index) {
        return (
            <Text key={index} disabled
                  style={[{
                      height: 22,
                      marginLeft: 4,
                      marginRight: 4,
                      borderRadius: 2,
                      paddingHorizontal: 4,
                      marginVertical: 1,
                      backgroundColor: program.colour,
                      color: Colors.TextOnPrimaryColor,
                  }, Styles.userProfileProgramTitle]}
                  numberOfLines={1} ellipsizeMode='tail'>{this.I18n.t(program.operationalProgramName || program.name)}</Text>
        );
    }

    renderRow(groupSubject, index) {
        const iconContainerStyle = {minHeight: 40, alignItems: 'center', justifyContent: 'center'};
        return (
            <View style={styles.rowContainer}>
                <TouchableOpacity onPress={() => this.props.onMemberSelection(groupSubject.memberSubject.uuid)}>
                    <View key={index} style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingTop: 10,
                            paddingBottom: 10,
                            backgroundColor: Styles.greyBackground
                        }}>
                            <View style={{
                                paddingHorizontal: 20,
                                justifyContent: 'center',
                            }}>
                                <SubjectProfilePicture containerStyle={iconContainerStyle} size={18}
                                                       subjectType={groupSubject.memberSubject.subjectType}
                                                       individual={groupSubject.memberSubject}/>
                            </View>
                        <View style={{ flex: 1, flexDirection: 'column' }}>
                            {this.renderGroupMember(groupSubject)}
                            <View style={{ flex: 0.8, flexWrap: 'wrap', flexDirection: 'row' }}>
                                {this.renderEnrolledPrograms(groupSubject.memberSubject)}
                            </View>
                        </View>
                        <View style={{
                            flex: 0.2,
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between'
                        }}>
                            <Actions key={index} actions={this.props.actions} item={groupSubject}/>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    renderHeader() {
        return (
            <View>
                <View style={styles.container}>
                    <View style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text
                            style={[Fonts.typography("paperFontSubhead"), {color: Styles.blackColor}]}>{this.I18n.t('name')}</Text>
                    </View>
                    <View style={{flex: 0.2, alignSelf: 'stretch'}}>
                        <Text
                            style={[Fonts.typography("paperFontSubhead"), {color: Styles.blackColor}]}>{this.I18n.t('actions')}</Text>
                    </View>
                </View>
                <View style={{paddingVertical: 3}}>
                    <Separator height={1.5}/>
                </View>
            </View>
        );
    }

    render() {
        const dataSource = ListViewHelper.getDataSource(this.props.groupSubjects);
        return (
            <ListView
                enableEmptySections={true}
                dataSource={dataSource}
                removeClippedSubviews={true}
                renderSeparator={(ig, idx) => (<Separator key={idx} height={1}/>)}
                renderHeader={() => this.renderHeader()}
                renderRow={(groupSubjectRealmObject, index) => this.renderRow(new GroupSubject(groupSubjectRealmObject), index)}
            />
        );
    }


}

export default Members;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignSelf: 'stretch',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: 6
    },
    rowContainer: {
        paddingVertical: 4,
    }
});
