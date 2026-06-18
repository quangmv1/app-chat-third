export type PSColors = {
  Primary: {
    branding: string;
    decorative: string;
    mainText: string;
    subText: string;
    placeHolder: string;
    disable: string;
    border: string;
    linerBorder: string;
    background: string;
    bgBranding: string;
    bgBubble: string;
    white: string;
  };
  Branding: {
    b50: string;
    b100: string;
    b200: string;
    b300: string;
    b400: string;
    b500: string;
    b600: string;
    b700: string;
    b800: string;
  };
  SubBranding: {
    sb25: string;
    sb50: string;
    sb100: string;
    sb200: string;
    sb300: string;
    sb400: string;
    sb500: string;
    sb600: string;
    sb700: string;
    sb800: string;
    sb900: string;
  };
  Neutral: {
    n0: string;
    n25: string;
    n50: string;
    n100: string;
    n200: string;
    n300: string;
    n400: string;
    n500: string;
    n600: string;
    n700: string;
    n800: string;
    n1000: string;
  };
  Active: {
    light: string;
    normal: string;
  };
  Negative: {
    light: string;
    normal: string;
  };
  Progress: {
    light: string;
    normal: string;
  };
  Critical: {
    light: string;
    normal: string;
  };
};

export const PSLightColorsDefault: PSColors = {
  Primary: {
    branding: '#6654D1',
    decorative: '#f75c08',
    mainText: '#231b52',
    subText: '#676767',
    placeHolder: '#cfcfcf',
    disable: '#ADADAD',
    border: '#CFCFCF',
    linerBorder: '#e6e6e6',
    background: '#F5F5F5',
    bgBranding: '#F5F3FD',
    bgBubble: '#DEEBFF',
    white: '#FFFFFF',
  },
  Branding: {
    b50: '#F5F3FD',
    b100: '#E8E4FC',
    b200: '#CFC8F8',
    b300: '#6654D1',
    b400: '#5242A6',
    b500: '#45388C',
    b600: '#342680',
    b700: '#2D2269',
    b800: '#231b52',
  },
  SubBranding: {
    sb25: '#FEF8F4',
    sb50: '#feefe6',
    sb100: '#fee7da',
    sb200: '#fdccb2',
    sb300: '#f75c08',
    sb400: '#de5307',
    sb500: '#b94506',
    sb600: '#943705',
    sb700: '#6f2904',
    sb800: '#562003',
    sb900: '#401802',
  },
  Neutral: {
    n0: '#FFFFFF',
    n25: '#FAFAFA',
    n50: '#F5F5F5',
    n100: '#F0F0F0',
    n200: '#e6e6e6',
    n300: '#cfcfcf',
    n400: '#b8b8b8',
    n500: '#adadad',
    n600: '#8a8a8a',
    n700: '#676767',
    n800: '#515151',
    n1000: '#404040',
  },
  Active: {
    light: '#e8f9f1',
    normal: '#19c273',
  },
  Negative: {
    light: '#feeeee',
    normal: '#f45252',
  },
  Progress: {
    light: '#e9f7ff',
    normal: '#24b0ff',
  },
  Critical: {
    light: '#fef7ee',
    normal: '#f4b152',
  },
};

export const PSDarkColorsDefault: PSColors = {
  Primary: {
    branding: '#7762F5',
    decorative: '#f75c08',
    mainText: '#F0EDFE',
    subText: '#adadad',
    placeHolder: '#4b4b4b',
    disable: '#9C9C9C',
    border: '#474747',
    linerBorder: '#333333',
    background: '#1a1a1a',
    bgBranding: '#2F246D',
    bgBubble: '#3D4E66',
    white: '#262626',
  },
  Branding: {
    b50: '#F5F3FD',
    b100: '#E8E4FC',
    b200: '#CFC8F8',
    b300: '#6654D1',
    b400: '#5242A6',
    b500: '#45388C',
    b600: '#342680',
    b700: '#2D2269',
    b800: '#231b52',
  },
  SubBranding: {
    sb25: '#FEF8F4',
    sb50: '#feefe6',
    sb100: '#fee7da',
    sb200: '#fdccb2',
    sb300: '#f75c08',
    sb400: '#de5307',
    sb500: '#b94506',
    sb600: '#943705',
    sb700: '#6f2904',
    sb800: '#562003',
    sb900: '#401802',
  },
  Neutral: {
    n0: '#050505',
    n25: '#0b0b0b',
    n50: '#141414',
    n100: '#1a1a1a',
    n200: '#242424',
    n300: '#4b4b4b',
    n400: '#585858',
    n500: '#676767',
    n600: '#9c9c9c',
    n700: '#adadad',
    n800: '#BBBBBB',
    n1000: '#CCCCCC',
  },
  Active: {
    light: '#ebfbf3',
    normal: '#32d287',
  },
  Negative: {
    light: '#691010',
    normal: '#F45252',
  },
  Progress: {
    light: '#e9f7ff',
    normal: '#24b0ff',
  },
  Critical: {
    light: '#fef7ee',
    normal: '#f4b152',
  },
};
