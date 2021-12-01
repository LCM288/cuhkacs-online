import React from "react";

export const prevent = (event: React.SyntheticEvent): void => {
  event.preventDefault();
};

export const stopAndPrevent = (event: React.SyntheticEvent): void => {
  event.stopPropagation();
  event.preventDefault();
};

export const StopClickDiv = ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => <div onClick={stop}>{children}</div>;

export const PreventDefaultForm = ({
  children,
  onSubmit,
}: {
  children: React.ReactElement;
  onSubmit: (event: React.FormEvent<HTMLElement>) => void;
}): React.ReactElement => (
  <form
    onSubmit={(event: React.FormEvent<HTMLElement>) => {
      prevent(event);
      onSubmit(event);
    }}
  >
    {children}
  </form>
);
