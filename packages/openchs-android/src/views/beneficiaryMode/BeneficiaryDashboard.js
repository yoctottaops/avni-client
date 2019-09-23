import React from 'react';
import PropTypes from 'prop-types';
import {Text, View} from 'react-native';
import AbstractComponent from "../../framework/view/AbstractComponent";
import Reducers from "../../reducer";
import Actions from '../../action/beneficiaryMode/BeneficiaryDashboardActions';
import Path from "../../framework/routing/Path";
import CHSContent from "../common/CHSContent";
import Colors from "../primitives/Colors";
import Styles from "../primitives/Styles";
import AppHeader from "../common/AppHeader";
import IndividualProfile from "../common/IndividualProfile";
import CHSContainer from "../common/CHSContainer";
import NewVisitMenuView from "../program/NewVisitMenuView";
import PreviousEncounters from "../common/PreviousEncounters";
import {Form} from 'openchs-models';
import CHSNavigator from "../../utility/CHSNavigator";
import SystemRecommendationView from "../conclusion/SystemRecommendationView";

@Path('/BeneficiaryDashboard')
export default class BeneficiaryDashboard extends AbstractComponent {
    static propTypes = {
        beneficiary: PropTypes.object.isRequired
    };

    constructor(props, context) {
        super(props, context, Reducers.reducerKeys.beneficiaryDashboard);
    }

    viewName() {
        return "BeneficiaryDashboard";
    }

    componentWillMount() {
        this.dispatchAction(Actions.onLoad, {
            beneficiary: this.props.beneficiary,
        });
        super.componentWillMount();
    }

    renderCompletedVisits() {
        return <React.Fragment>
            {!_.isEmpty(this.state.completedEncounters) && (
                <PreviousEncounters encounters={this.state.completedEncounters}
                                    formType={Form.formTypes.ProgramEncounter}
                                    showCount={5}
                                    showPartial={true}
                                    title={this.I18n.t('visitsCompleted')}
                                    emptyTitle={this.I18n.t('noCompletedEncounters')}
                                    expandCollapseView={true}
                                    onToggleAction={Actions.onEncounterToggle}
                                    enrolment={this.state.enrolment}/>
            )}
            {!_.isEmpty(this.state.completedGeneralEncounters) && (
                <PreviousEncounters encounters={this.state.completedGeneralEncounters}
                                    formType={Form.formTypes.Encounter}
                                    showCount={5}
                                    showPartial={true}
                                    expandCollapseView={true}
                                    onToggleAction={Actions.onGeneralEncounterToggle}/>
            )}
        </React.Fragment>;
    }

    renderEncountersSection() {
        const enrolmentUUID = this.state.enrolment && this.state.enrolment.uuid;
        const individualUUID = this.props.beneficiary && this.props.beneficiary.uuid;
        const onSaveCallback = (view: SystemRecommendationView) =>
            CHSNavigator.navigateToBeneficiaryDashboard(view, this.props);
        return (<NewVisitMenuView
            enrolmentUUID={enrolmentUUID} individualUUID={individualUUID} onSaveCallback={onSaveCallback}/>);
    }

    render() {
        return <CHSContainer>
            <CHSContent style={{backgroundColor: Colors.GreyContentBackground}}>
                <View style={{backgroundColor: Styles.defaultBackground}}>
                    <AppHeader title={this.I18n.t('individualDashboard')} func={this.props.backFunction}/>
                    <IndividualProfile style={{marginHorizontal: 16}}
                                       individual={this.props.beneficiary}
                                       viewContext={IndividualProfile.viewContext.General}
                                       hideEnrol={true}
                    />
                </View>
                <View style={{marginHorizontal: 8}}>
                    {this.renderEncountersSection()}
                </View>
                <View style={{marginHorizontal: 16, marginTop: 12}}>
                    {this.renderCompletedVisits()}
                </View>
            </CHSContent>
        </CHSContainer>
    }
}