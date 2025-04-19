
export enum BloodGroup {
	None = '',
	APositive = 'A+',
	ANegative = 'A-',
	BPositive = 'B+',
	BNegative = 'B-',
	ABPositive = 'AB+',
	ABNegative = 'AB-',
	OPositive = 'O+',
	ONegative = 'O-',
}

export interface Emergency {
    _id: string;      
    bloodGroup: BloodGroup;                          
    placement: string;
    phoneNumber: number;
    sickPersonInfo: string;
	isConfirmed: boolean; 
}
