import ComplicationsBuilder from "../rules/complicationsBuilder";

const institutionalDelivery = (enrolment, encounter) => {
    const medicalHistory = ["Hypertension", "Heart-related Diseases", "Diabetes",
        "Sickle Cell", "Epilepsy", "Renal Disease", "HIV/AIDS"];
    const pastComplications = [
        "Ante Partum Haemorrhage", "Intrauterine Growth Retardation", "Pre-term labour", "Prolonged labour",
        "Instrumental Delivery", "LSCS/C-section", "Intrauterine death", "Threatened abortion",
        "3 or more than 3 spontaneous abortions", "Still Birth", "Multiple Births", "Retained Placenta",
        "Post Partum Haemorrhage", "Intrapartum Death", "Neonatal death within first 28 days",
        "Congenital anomaly"
    ];
    const recommendationBuilder = new ComplicationsBuilder({
        programEnrolment: enrolment,
        programEncounter: encounter,
        complicationsConcept: 'Recommendations'
    });
    recommendationBuilder.addComplication("Institutional Delivery").when.age.is.lessThan(18)
        .or.when.age.is.greaterThan(30)
        .or.when.valueInRegistration("Blood group").containsAnyAnswerConceptName("AB-", "O-", "A-", "B-")
        .or.when.valueInRegistration("Medical history").containsAnyAnswerConceptName(...medicalHistory)
        .or.when.valueInEnrolment("Height").is.lessThan(145)
        .or.when.valueInEnrolment("Gravida").is.equals(1)
        .or.when.valueInEnrolment("Gravida").is.greaterThanOrEqualTo(5)
        .or.when.valueInEnrolment("Age of youngest child").asAge.is.lessThan(1)
        .or.when.valueInEnrolment("Obstetrics history").containsAnyAnswerConceptName(...pastComplications)
        .or.when.valueInEncounter("Systolic").greaterThanOrEqualTo(140)
        .or.when.valueInEncounter("Diastolic").greaterThanOrEqualTo(90)
        .or.when.valueInEncounter("Urine Albumin").containsAnyAnswerConceptName("Trace", "+1", "+2", "+3", "+4")
        .or.when.valueInEncounter("Urine Sugar").containsAnyAnswerConceptName("Trace", "+1", "+2", "+3", "+4")
        .or.when.valueInEncounter("USG Scanning Report - Number of foetus").containsAnyAnswerConceptName("One", "Two", "Three", "More than three")
        .or.when.valueInEncounter("USG Scanning Report - Liquour").containsAnyAnswerConceptName("Increased", "Decreased")
        .or.when.valueInEncounter("USG Scanning Report - Placenta Previa").containsAnyAnswerConceptName("Previa")
        .or.when.valueInEncounter("Foetal presentation").containsAnyAnswerConceptName("Transverse", "Breech")
        .or.when.valueInEncounter("VDRL").containsAnyAnswerConceptName("Positive")
        .or.when.valueInEncounter("HIV/AIDS Test").containsAnyAnswerConceptName("Positive")
        .or.when.valueInEncounter("HbsAg").containsAnyAnswerConceptName("Positive")
        .or.when.valueInEncounter("Sickling Test").containsAnyAnswerConceptName("Positive")
        .or.when.valueInEncounter("Hb Electrophoresis").containsAnyAnswerConceptName("SS")
        .or.when.valueInEntireEnrolment("Recommendations").containsAnyAnswerConceptName("Institutional Delivery")
    ;

    recommendationBuilder.addComplication("Institutional ANC")
        .when.valueInRegistration("Medical history").containsAnyAnswerConceptName(...medicalHistory)
        .or.when.valueInEnrolment("Age of youngest child").asAge.is.lessThan(1)
        .or.when.valueInEnrolment("Obstetrics history").containsAnyAnswerConceptName("3 or more than 3 spontaneous abortions")
        .or.when.valueInEncounter("Systolic").greaterThanOrEqualTo(140)
        .or.when.valueInEncounter("Diastolic").greaterThanOrEqualTo(90)
        .or.when.valueInEncounter("Urine Albumin").containsAnyAnswerConceptName("Trace", "+1", "+2", "+3", "+4")
        .or.when.valueInEncounter("Urine Sugar").containsAnyAnswerConceptName("Trace", "+1", "+2", "+3", "+4")
        .or.when.valueInEncounter("USG Scanning Report - Number of foetus").containsAnyAnswerConceptName("One", "Two", "Three", "More than three")
        .or.when.valueInEncounter("USG Scanning Report - Liquour").containsAnyAnswerConceptName("Increased", "Decreased")
        .or.when.valueInEncounter("USG Scanning Report - Placenta Previa").containsAnyAnswerConceptName("Previa")
        .or.when.valueInEncounter("Foetal presentation").containsAnyAnswerConceptName("Transverse", "Breech")
        .or.when.valueInEntireEnrolment("Recommendations").containsAnyAnswerConceptName("Institutional ANC")
    ;

    recommendationBuilder.addComplication("Keep the baby warm")
        .when.valueInEncounter("Pulse").lessThan(100)
        .or.when.valueInEncounter("Pulse").greaterThan(160)
        .or.when.valueInEncounter("Respiration Rate").lessThan(30)
        .or.when.valueInEncounter("Respiration Rate").greaterThan(60)
    ;

    recommendationBuilder.addComplication("Keep the baby warm by giving mother's skin to skin contact and covering the baby's head, hands and feet with a cap, gloves and socks resp.")
        .when.valueInEncounter("Temperature").lessThan(97.5)
    ;

    recommendationBuilder.addComplication("Give exclusive breast feeding")
        .when.valueInEncounter("Temperature").lessThan(97.5)
    ;

    return recommendationBuilder.getComplications()
};

const generateRecommendations = (enrolment, encounter) => {
    return institutionalDelivery(enrolment, encounter);
};

export default generateRecommendations;