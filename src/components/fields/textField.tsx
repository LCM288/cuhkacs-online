import React from "react";
import { Form } from "react-bulma-components";

const { Input, Field, Control, Label } = Form;

interface Props {
  value: string;
  setValue?: (value: string) => void;
  label: string;
  maxLength?: number | undefined;
  placeholder?: string;
  editable?: boolean;
  type?: string;
  pattern?: string | undefined;
  required?: boolean;
  loading?: boolean;
  fullwidth?: boolean;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
}

const TextField = ({
  value,
  setValue = () => {},
  label,
  maxLength,
  placeholder = label,
  editable = false,
  type = "text",
  pattern,
  required = false,
  loading,
  fullwidth,
  onBlur,
  autoFocus,
}: Props): React.ReactElement => {
  return (
    <>
      <Field>
        <Control fullwidth={fullwidth} loading={loading}>
          <Label>
            {label}
            {required && " *"}
          </Label>
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
              setValue(event.target.value)
            }
            disabled={!editable}
            type={type}
            pattern={pattern}
            maxLength={maxLength}
            required={required}
            onBlur={onBlur}
            autoFocus={autoFocus}
          />
        </Control>
      </Field>
    </>
  );
};

export default TextField;
