import BaseIntegrationTest from "./BaseIntegrationTest";
import {
    EntityApprovalStatus,
    AddressLevel,
    Concept,
    Form,
    StandardReportCardType,
    FormElement,
    FormElementGroup,
    FormMapping,
    Gender,
    Individual,
    OrganisationConfig,
    Settings,
    SubjectType,
    CustomFilter,
    ReportCard
} from "openchs-models";
import TestConceptFactory from "../test/model/TestConceptFactory";
import TestAddressLevelFactory from "../test/model/TestAddressLevelFactory";
import TestGenderFactory from "../test/model/TestGenderFactory";
import TestSettingsFactory from "../test/model/user/TestSettingsFactory";
import TestSubjectTypeFactory from "../test/model/TestSubjectTypeFactory";
import TestFormFactory from "../test/model/form/TestFormFactory";
import TestFormElementGroupFactory from "../test/model/form/TestFormElementGroupFactory";
import TestFormElementFactory from "../test/model/form/TestFormElementFactory";
import TestKeyValueFactory from "../test/model/TestKeyValueFactory";
import TestFormMappingFactory from "../test/model/form/TestFormMappingFactory";
import TestOrganisationConfigFactory from "../test/model/TestOrganisationConfigFactory";
import TestSubjectFactory from "../test/model/txn/TestSubjectFactory";
import TestObsFactory from "../test/model/TestObsFactory";
import TestEntityApprovalStatusFactory from "../test/model/TestEntityApprovalStatusFactory";
import ReportCardService from "../src/service/customDashboard/ReportCardService";
import TestStandardReportCardTypeFactory from "../test/model/reportNDashboard/TestStandardReportCardTypeFactory";
import TestReportCardFactory from "../test/model/reportNDashboard/TestReportCardFactory";
import TestDashboardReportRuleInputFactory from "../test/model/reportNDashboard/TestDashboardReportRuleInputFactory";
import TestDashboardReportFilterRuleInputFactory from "../test/model/reportNDashboard/TestDashboardReportFilterRuleInputFactory";

class ReportCardServiceIntegrationTest extends BaseIntegrationTest {
    approvedCard; subjectType;

    setup() {
        super.setup();
        this.executeInWrite((db) => {
            this.concept = db.create(Concept, TestConceptFactory.createWithDefaults({dataType: Concept.dataType.Text}));
            this.addressLevel = db.create(AddressLevel, TestAddressLevelFactory.createWithDefaults({level: 1}));
            this.gender = db.create(Gender, TestGenderFactory.createWithDefaults({name: "Male"}));
            db.create(Settings, TestSettingsFactory.createWithDefaults({}));

            this.subjectType = db.create(SubjectType, TestSubjectTypeFactory.createWithDefaults({type: SubjectType.types.Person, name: 'Beneficiary'}));
            const form = db.create(Form, TestFormFactory.createWithDefaults({formType: Form.formTypes.IndividualProfile}));
            const formElementGroup = db.create(FormElementGroup, TestFormElementGroupFactory.create({form: form}));
            db.create(FormElement, TestFormElementFactory.create({
                uuid: "FOO",
                concept: this.concept,
                displayOrder: 1,
                formElementGroup: formElementGroup,
                mandatory: true,
                keyValues: [TestKeyValueFactory.create({key: "unique", value: "true"})]
            }));
            db.create(FormMapping, TestFormMappingFactory.createWithDefaults({subjectType: this.subjectType, form: form}));
            db.create(OrganisationConfig, TestOrganisationConfigFactory.createWithDefaults({}));
            const subject = db.create(Individual, TestSubjectFactory.createWithDefaults({subjectType: this.subjectType, address: this.addressLevel, firstName: "foo", lastName: "bar", observations: [TestObsFactory.create({concept: this.concept, valueJSON: JSON.stringify(this.concept.getValueWrapperFor("ABC"))})]}));
            db.create(EntityApprovalStatus, TestEntityApprovalStatusFactory.create({entityType: EntityApprovalStatus.entityType.Subject, entityUUID: subject.uuid, entityTypeUuid: this.subjectType.uuid}));

            const approvedCardType = db.create(StandardReportCardType, TestStandardReportCardTypeFactory.create({name: StandardReportCardType.type.Approved}));
            this.approvedCard = db.create(ReportCard, TestReportCardFactory.create({name: "foo", standardReportCardType: approvedCardType}));
        });
    }

    getResultForApprovalCardsType() {
        const dashboardReportRuleInput = TestDashboardReportRuleInputFactory.create({filterValues: [TestDashboardReportFilterRuleInputFactory.create({type: CustomFilter.type.Concept, filterValue: [this.addressLevel]})]});
        this.getService(ReportCardService).getReportCardCount(this.approvedCard, dashboardReportRuleInput);
    }
}

export default ReportCardServiceIntegrationTest;
