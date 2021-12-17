import React from "react";

export const stopEvent = (event: React.SyntheticEvent): void => {
  event.stopPropagation();
};

export const prevent = (event: React.SyntheticEvent): void => {
  event.preventDefault();
};

export const stopAndPrevent = (event: React.SyntheticEvent): void => {
  event.stopPropagation();
  event.preventDefault();
};

export const StopClickDiv = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}): React.ReactElement => (
  <div onClick={stopEvent} style={style}>
    {children}
  </div>
);

export const PreventDefaultForm = ({
  children,
  onSubmit,
  className,
  style,
}: {
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent<HTMLElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}): React.ReactElement => (
  <form
    onSubmit={(event: React.FormEvent<HTMLElement>) => {
      prevent(event);
      onSubmit(event);
    }}
    className={className}
    style={style}
  >
    {children}
  </form>
);
