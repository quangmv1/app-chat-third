export type PSMessageFormModel = {
  id: string;
  settingsForm?: SettingsFormModel;
  blocks: BlocksModel[];
};

export type SettingsFormModel = {
  title: string;
  required: boolean;
  invitation: string;
  submission: string;
  description: string;
};

export type BlocksModel = {
  id: string;
  value: string;
  type: FormInputType;
  form: FormModel;
  items: ItemModel[];
};

export enum FormInputType {
  TextInput = 1,
  NumberInput = 2,
  EmailInput = 3,
  UrlInput = 4,
  DateInput = 5,
  PhoneNumberInput = 6,
  ChoiceInput = 7,
}

export enum FormType {
  SingleChoice = 1,
  Checkbox = 2,
  Dropdown = 3,
}

export type FormModel = {
  label: string;
  required: boolean;
  description: string;
  placeholder: string;
  initialValue: string;

  isLong: boolean;
  attachments: AttachmentsModel;

  max: number | string;
  min: number | string;

  isRange: boolean;
  withTime: boolean;
  format: string;

  type: FormType;
};

export type AttachmentsModel = {
  isEnabled: boolean;
};

export type ItemModel = {
  id: string;
  content: string;
};

export const mapPSMessageFormEntityToModel = (entity?: string) => {
  if (entity) {
    return JSON.parse(String.raw`${entity}`) as PSMessageFormModel;
  } else {
    return undefined;
  }
};
