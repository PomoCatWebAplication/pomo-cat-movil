
declare module '*.css' {
  const content: unknown;
  export default content;
}


declare module '*.png' {
  const uri: string;
  export default uri;
}

declare module '*.jpg' {
  const uri: string;
  export default uri;
}

declare module '*.jpeg' {
  const uri: string;
  export default uri;
}


declare module '*.mp3' {
  const uri: string;
  export default uri;
}

declare module '*.wav' {
  const uri: string;
  export default uri;
}


declare module '*.svg' {
  import type { FunctionComponent } from 'react';
  import type { SvgProps } from 'react-native-svg';

  const content: FunctionComponent<SvgProps>;
  export default content;
}
