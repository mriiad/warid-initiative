"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationType = exports.DonationTypeValues = exports.BloodGroup = exports.BloodGroupValues = exports.fromNameLabels = void 0;
function fromNameLabels(src) {
    return src.map(([name, label]) => ({ name, label }));
}
exports.fromNameLabels = fromNameLabels;
function fromLabelledEnum(src) {
    return src.reduce((res, { name }) => {
        res[name] = name;
        return res;
    }, Object.create(null));
}
exports.BloodGroupValues = fromNameLabels([
    ['Aplus', 'A+'],
    ['Aminus', 'A-'],
    ['Bplus', 'B+'],
    ['Bminus', 'B-'],
    ['Oplus', 'O+'],
    ['Ominus', 'O-'],
    ['ABplus', 'AB+'],
    ['ABminus', 'AB-'],
]);
exports.BloodGroup = fromLabelledEnum(exports.BloodGroupValues);
exports.DonationTypeValues = fromNameLabels([
    ['blood', 'دم'],
    ['platelets', 'صفائح'],
]);
exports.DonationType = fromLabelledEnum(exports.DonationTypeValues);
