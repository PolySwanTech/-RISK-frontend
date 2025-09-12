export enum OperatingLossFamily {
    FINANCIER = "FINANCIER",
    NON_FINANCIER = "NON_FINANCIER"
}

export const OperatingLossFamilyLabels: Record<OperatingLossFamily, string> = {
    [OperatingLossFamily.FINANCIER]: 'Financier',
    [OperatingLossFamily.NON_FINANCIER]: 'Non financier',
}