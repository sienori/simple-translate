declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.svg" {
  import * as React from "react";

  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module "react-copy-to-clipboard" {
  import * as React from "react";

  interface Options {
    debug?: boolean;
    message?: string;
  }

  interface Props {
    text: string;
    onCopy?: (text: string, result: boolean) => void;
    options?: Options;
    children?: React.ReactNode;
  }

  export default class CopyToClipboard extends React.Component<Props> {}
}

declare module "react-toggle" {
  import * as React from "react";

  interface Props {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
    value?: string;
    id?: string;
    "aria-labelledby"?: string;
    disabled?: boolean;
    icons?: {
      checked: React.ReactNode;
      unchecked: React.ReactNode;
    };
    className?: string;
  }

  export default class Toggle extends React.Component<Props> {}
}
