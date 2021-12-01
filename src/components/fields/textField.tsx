import React from "react";
import { Form } from "react-bulma-components";

const { Input, Field, Control, Label } = Form;

interface Props {
  value: string;
  setValue?: (value: string) => void;
  label: string;
  placeholder?: string;
  editable?: boolean;
  type?: string;
  pattern?: string | undefined;
  required?: boolean;
}

const TextField = ({
  value,
  setValue = () => {},
  label,
  placeholder = "",
  editable = false,
  type = "text",
  pattern,
  required = false,
}: Props): React.ReactElement => {
  return (
    <>
      <Field>
        <Label>{label}</Label>
        <Control>
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
              setValue(event.target.value)
            }
            disabled={!editable}
            type={type}
            pattern={pattern}
            required={required}
          />
        </Control>
      </Field>
    </>
  );
};

export default TextField;
