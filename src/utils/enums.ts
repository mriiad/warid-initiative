interface LabelledEnum<T extends string = string> {
    name: T
    label: string
}

export function fromNameLabels<T extends string>(src: Array<[T, string]>): Array<LabelledEnum<T>> {
    return src.map(([name, label]) => ({ name, label }))
}

function fromLabelledEnum<T extends string>(src: Array<LabelledEnum<T>>): { [K in T]: K } {
    return src.reduce((res, { name }) => {
      res[name] = name
      return res
    }, Object.create(null))
}

export const BloodGroupValues = fromNameLabels([
    ['Aplus', 'A+'],
    ['Aminus', 'A-'],
    ['Bplus', 'B+'],
    ['Bminus', 'B-'],
    ['Oplus', 'O+'],
    ['Ominus', 'O-'],
    ['ABplus', 'AB+'],
    ['ABminus', 'AB-'],
])
export const BloodGroup = fromLabelledEnum(BloodGroupValues)
export type BloodGroup = keyof typeof BloodGroup

export const DonationTypeValues = fromNameLabels([
    ['blood', 'دم'],
    ['platelets', 'صفائح'],
])
export const DonationType = fromLabelledEnum(DonationTypeValues)
export type DonationType = keyof typeof DonationType